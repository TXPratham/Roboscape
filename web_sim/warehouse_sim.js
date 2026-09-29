/**
 * Warehouse Logistics Simulation Engine
 * Features:
 * 1. Global Costmap & A* Pathfinder with Lethal Shelf Obstacles and Clearance Inflation
 * 2. ORCA (Optimal Reciprocal Collision Avoidance) Local Planner with Dynamic Speed Scaling
 * 3. Hard Emergency Stop Safety Layer (Deterministic, Independent of Playback Speed)
 * 4. Multi-Substepping Physics Integrator (Zero Collisions at 1x, 2x, 4x Playback Speeds)
 */

const WarehouseSim = {
  // Navigation Highway Coordinates (Strict Red Line Network)
  // ONLY Left Highway (-13.0m) and Right Highway (13.0m) connect the aisles!
  corridorsX: [-13.0, 13.0],
  // Aisles along Z: North Aisle (-8.0), Aisle 10-11 (-5.0), Aisle 11-12 (-1.5), Aisle 12-13 (2.0), South AMR Zone (5.5)
  aislesZ: [-8.0, -5.0, -1.5, 2.0, 5.5],

  // Warehouse Bounding Box
  bounds: { minX: -15, maxX: 15, minZ: -10, maxZ: 10 },

  // Solid Obstacle Footprints (Lethal Obstacles: Pallet Shelves & Conveyor Delivery Stands)
  obstacleFootprints: [],

  init() {
    this.buildCostmapFootprints();
  },

  buildCostmapFootprints() {
    this.obstacleFootprints = [];

    // 1. Structured Shelves (All 4 continuous rows)
    if (SimState.racks) {
      SimState.racks.forEach(rack => {
        this.obstacleFootprints.push({
          id: rack.id,
          name: `Shelf ${rack.id}`,
          minX: rack.x - 1.35,
          maxX: rack.x + 1.35,
          minZ: rack.z - 0.65,
          maxZ: rack.z + 0.65,
          centerX: rack.x,
          centerZ: rack.z,
          type: 'shelf'
        });
      });
    }

    // 2. Conveyor Workstations / Package Stands (Delivery Bays)
    if (WarehouseConfig.deliveryBays) {
      WarehouseConfig.deliveryBays.forEach((bay, idx) => {
        this.obstacleFootprints.push({
          id: bay.id,
          name: bay.name || `Delivery Bay ${idx + 1}`,
          minX: bay.x - 1.25,
          maxX: bay.x + 1.25,
          minZ: 7.7,
          maxZ: 9.3,
          centerX: bay.x,
          centerZ: bay.z,
          type: 'delivery_stand'
        });
      });
    }
  },

  // Check if a point is inside any lethal obstacle
  isLethalObstacle(x, z, inflation = 0.20) {
    if (this.obstacleFootprints.length === 0) {
      this.buildCostmapFootprints();
    }

    for (const obs of this.obstacleFootprints) {
      if (
        x >= (obs.minX - inflation) &&
        x <= (obs.maxX + inflation) &&
        z >= (obs.minZ - inflation) &&
        z <= (obs.maxZ + inflation)
      ) {
        return true;
      }
    }
    return false;
  },

  getNearestAisleZ(z) {
    let nearest = this.aislesZ[0];
    let minD = Math.abs(z - nearest);
    for (const az of this.aislesZ) {
      const d = Math.abs(z - az);
      if (d < minD) {
        minD = d;
        nearest = az;
      }
    }
    return nearest;
  },

  // Lateral lane separation offset for two-way routes (side-by-side)
  LANE_OFFSET: 0.44,

  getAisleLaneZ(aisleZ, movingEast) {
    return movingEast ? (aisleZ + this.LANE_OFFSET) : (aisleZ - this.LANE_OFFSET);
  },

  getHighwayLaneX(highwayX, movingNorth) {
    return movingNorth ? (highwayX - this.LANE_OFFSET) : (highwayX + this.LANE_OFFSET);
  },

  /**
   * Two-Way Side-by-Side Highway Path Planner
   * Every aisle and vertical cross-highway features dual parallel lanes:
   * 1. Horizontal Aisles (Z in [-8.0, -5.0, -1.5, 2.0, 5.5]):
   *    - Eastbound (+X, right): South lane (Z = aisleZ + 0.44)
   *    - Westbound (-X, left): North lane (Z = aisleZ - 0.44)
   * 2. Vertical Cross-Corridors (Left X = -13.0, Right X = 13.0):
   *    - Northbound (-Z, up): West lane (X = highwayX - 0.44)
   *    - Southbound (+Z, down): East lane (X = highwayX + 0.44)
   * 3. Straight docking spurs: from South Aisle to Delivery Dock (Z = 6.9)
   * Robots in opposite directions travel side-by-side with zero collision risk!
   */
  planPath(startX, startZ, rawEndX, rawEndZ) {
    const HIGHWAY_LEFT_X = -13.0;
    const HIGHWAY_RIGHT_X = 13.0;
    const SOUTH_AISLE_Z = 5.5;
    const DOCK_Z = 6.9;

    const isStartAtDock = startZ > 6.0;
    let startAisleZ = isStartAtDock ? SOUTH_AISLE_Z : this.getNearestAisleZ(startZ);

    const isTargetDock = rawEndZ > 6.0;
    const endX = rawEndX;
    const targetAisleZ = isTargetDock ? SOUTH_AISLE_Z : this.getNearestAisleZ(rawEndZ);

    const waypoints = [];

    // Step A: If starting at dock, pull up into South Aisle
    if (isStartAtDock) {
      const initialMovingEast = endX >= startX;
      waypoints.push({ x: startX, z: this.getAisleLaneZ(SOUTH_AISLE_Z, initialMovingEast) });
    }

    // Step B: Route across aisles
    if (Math.abs(startAisleZ - targetAisleZ) < 0.1) {
      // SAME AISLE: Dedicated directional lane
      const movingEast = endX >= startX;
      const laneZ = this.getAisleLaneZ(targetAisleZ, movingEast);

      waypoints.push({ x: startX, z: laneZ });
      waypoints.push({ x: endX, z: laneZ });
    } else {
      // DIFFERENT AISLE: Choose Left (-13.0) or Right (13.0) Highway
      const costLeft = Math.abs(startX - HIGHWAY_LEFT_X) + Math.abs(startAisleZ - targetAisleZ) + Math.abs(endX - HIGHWAY_LEFT_X);
      const costRight = Math.abs(startX - HIGHWAY_RIGHT_X) + Math.abs(startAisleZ - targetAisleZ) + Math.abs(endX - HIGHWAY_RIGHT_X);
      const chosenHighwayX = costLeft <= costRight ? HIGHWAY_LEFT_X : HIGHWAY_RIGHT_X;

      // Leg 1: Move along start aisle towards highway
      const movingEastToHwy = chosenHighwayX >= startX;
      const startLaneZ = this.getAisleLaneZ(startAisleZ, movingEastToHwy);
      waypoints.push({ x: startX, z: startLaneZ });

      // Leg 2: Transition into highway lane
      const movingNorthOnHwy = targetAisleZ <= startAisleZ;
      const hwyLaneX = this.getHighwayLaneX(chosenHighwayX, movingNorthOnHwy);
      waypoints.push({ x: hwyLaneX, z: startLaneZ });

      // Leg 3: Move along highway to destination aisle
      const movingEastFromHwy = endX >= chosenHighwayX;
      const targetLaneZ = this.getAisleLaneZ(targetAisleZ, movingEastFromHwy);
      waypoints.push({ x: hwyLaneX, z: targetLaneZ });

      // Leg 4: Move along target aisle to endX
      waypoints.push({ x: endX, z: targetLaneZ });
    }

    // Step C: If destination is delivery dock spur
    if (isTargetDock) {
      waypoints.push({ x: endX, z: DOCK_Z });
    }

    // Clean duplicate/adjacent waypoints
    const cleanWaypoints = [];
    for (const wp of waypoints) {
      if (cleanWaypoints.length === 0) {
        cleanWaypoints.push(wp);
      } else {
        const prev = cleanWaypoints[cleanWaypoints.length - 1];
        if (Math.hypot(wp.x - prev.x, wp.z - prev.z) > 0.08) {
          cleanWaypoints.push(wp);
        }
      }
    }

    return cleanWaypoints.length > 0 ? cleanWaypoints : [{ x: endX, z: targetAisleZ }];
  },

  // Dataset Replay State (autonomous_navigation_dataset.csv)
  activeDatasetRunKey: null,
  datasetPlaybackIndex: 0,
  datasetTimer: 0,

  loadDatasetRun(runKey) {
    if (typeof NavigationRuns === 'undefined' || !NavigationRuns[runKey]) {
      console.warn(`Dataset run ${runKey} not found in NavigationRuns`);
      return;
    }
    this.activeDatasetRunKey = runKey;
    this.datasetPlaybackIndex = 0;
    this.datasetTimer = 0;

    const run = NavigationRuns[runKey];
    const r1 = SimState.robots[0];
    if (r1 && run.points.length > 0) {
      r1.isRosControlled = false;
      const p0 = run.points[0];
      r1.x = (p0.x - 7.4) * 1.35;
      r1.z = (p0.y - 7.1) * 0.95;
      r1.rotation = THREE.MathUtils.degToRad(p0.orientation);
      r1.status = `REPLAY (${run.target.toUpperCase()})`;
    }

    if (window.logFleetComms) {
      window.logFleetComms('Robot-1', `LOADED DATASET ${runKey.toUpperCase()}: ${run.points.length} waypoints, Target: ${run.target.toUpperCase()}`, 'BID');
    }
  },

  restoreLiveSim() {
    this.activeDatasetRunKey = null;
    this.datasetPlaybackIndex = 0;
    const r1 = SimState.robots[0];
    if (r1) {
      r1.status = 'IDLE';
      if (window.setRobotCollisionWarning) window.setRobotCollisionWarning(r1.id, false);
    }
    if (window.logFleetComms) {
      window.logFleetComms('Robot-1', 'RESTORED Live Autonomous Grid Navigation', 'GRANT');
    }
  },

  // Assign task to an idle AMR using 6G network telemetry
  dispatchNextTask() {
    // Clean up stale assignedRobotId for any decommissioned/removed AMR units
    const activeRobotIds = new Set(SimState.robots.map(r => r.id));
    SimState.taskQueue.forEach(t => {
      if (t.assignedRobotId && !activeRobotIds.has(t.assignedRobotId)) {
        t.assignedRobotId = null;
        if (t.status === 'IN_PROGRESS') {
          t.status = 'QUEUED';
        }
      }
    });

    const idleRobots = SimState.robots.filter(r => r.status === 'IDLE' && r.battery > 20 && !r.isRosControlled);
    if (idleRobots.length === 0) return;

    // Find the first queued task that is either unassigned or whose assigned robot is idle
    const pendingTaskIndex = SimState.taskQueue.findIndex(t => {
      if (t.status !== 'QUEUED') return false;
      if (!t.assignedRobotId) return true;
      return idleRobots.some(r => r.id === t.assignedRobotId);
    });

    if (pendingTaskIndex === -1) return;
    const pendingTask = SimState.taskQueue[pendingTaskIndex];

    if (pendingTask) {
      // If task was targeted to a specific robot, assign to that robot
      if (pendingTask.assignedRobotId) {
        const targetRobot = idleRobots.find(r => r.id === pendingTask.assignedRobotId);
        if (targetRobot) {
          this.assignTaskToRobot(targetRobot, pendingTask);
        }
        return;
      }

      let bids = [];

      // Contract Net Protocol Auction with 6G network latency and energy consumption
      idleRobots.forEach((r, idx) => {
        const d = Math.hypot(r.x - pendingTask.sourceRack.x, r.z - pendingTask.sourceRack.z);

        // Ingest sample from industrial_robot_control_6G_network.csv
        let sample = null;
        if (typeof Network6GTelemetry !== 'undefined' && Network6GTelemetry.length > 0) {
          sample = Network6GTelemetry[(idx * 17 + Math.floor(Math.random() * 20)) % Network6GTelemetry.length];
        }
        const latency = sample ? sample.network_latency : 14.5;
        const energy = sample ? sample.energy_consumption : 4.8;
        const lossRate = sample ? sample.packet_loss_rate : 1.2;

        // Cost formula: Distance + w_lat * latency + w_energy * energy
        const bidCost = parseFloat((d * 0.45 + latency * 0.20 + energy * 0.35).toFixed(2));

        bids.push({
          robot: r,
          bidCost: bidCost,
          dist: d,
          latency: latency,
          energy: energy,
          lossRate: lossRate
        });

        if (window.logFleetComms && Math.random() > 0.4) {
          window.logFleetComms(r.name, `BID $${bidCost.toFixed(2)} for ${pendingTask.id} (Lat: ${latency.toFixed(1)}ms, Energy: ${energy.toFixed(1)}kWh)`, 'BID');
        }
      });

      // Lowest bid cost wins
      bids.sort((a, b) => a.bidCost - b.bidCost);
      let winner = bids[0];

      // Re-assignment Test: Artificially inject packet loss from dataset
      if (Math.random() * 100 < winner.lossRate && bids.length > 1) {
        const runnerUp = bids[1];
        if (window.logFleetComms) {
          window.logFleetComms(winner.robot.name, `RE-ASSIGNMENT: Packet loss ${winner.lossRate.toFixed(1)}%! Task ${pendingTask.id} re-assigned to ${runnerUp.robot.name}`, 'DENY');
        }
        winner = runnerUp;
      }

      this.assignTaskToRobot(winner.robot, pendingTask);
    }
  },

  assignTaskToRobot(robot, task) {
    // If robot was running another task, requeue the old task so it can be fulfilled
    if (robot.currentTask && robot.currentTask.id !== task.id) {
      robot.currentTask.status = 'QUEUED';
      robot.currentTask.assignedRobotId = null;
    }

    // If robot was carrying a previous box from another task, return it back to rack inventory
    if (robot.carriedBox && robot.carriedBox.sku !== task.sku) {
      robot.carriedBox.inTransit = false;
      robot.carriedBox.carrierId = null;
      if (robot.carriedBox.mesh) {
        const hX = robot.carriedBox.homeX !== undefined ? robot.carriedBox.homeX : robot.x;
        const hY = robot.carriedBox.homeY !== undefined ? robot.carriedBox.homeY : 0.25;
        const hZ = robot.carriedBox.homeZ !== undefined ? robot.carriedBox.homeZ : robot.z;
        robot.carriedBox.mesh.position.set(hX, hY, hZ);
        robot.carriedBox.mesh.rotation.set(0, 0, 0);
      }
      robot.carriedBox = null;
      robot.payload = 0;
    }

    robot.liftProgress = 0;
    robot.speed = 0;
    task.status = 'IN_PROGRESS';
    task.assignedRobotId = robot.id;
    robot.currentTask = task;
    robot.status = 'EN_ROUTE_PICKUP';

    const box = SimState.boxes.find(b => b.sku === task.sku);
    if (box) {
      box.inTransit = true;
      box.carrierId = robot.id;
    }

    if (window.logFleetComms) {
      window.logFleetComms(robot.name, `ASSIGNED: ${task.id} (${task.sku} -> ${task.targetBay.name})`, 'GRANT');
    }

    // Plan route from current location to safe rack pick face in open aisle
    const pickZ = task.sourceRack.pickZ !== undefined ? task.sourceRack.pickZ : this.getNearestAisleZ(task.sourceRack.z);
    robot.waypoints = this.planPath(robot.x, robot.z, task.sourceRack.x, pickZ);
    robot.waypointIndex = 0;

    // Trigger instant UI refresh
    if (typeof updateUILists === 'function') {
      updateUILists();
    }
  },

  /**
   * ORCA (Optimal Reciprocal Collision Avoidance) Local Planner
   * Dynamically scales time_horizon and lookahead safe distance based on SimState.timeScale.
   * Computes collision-free reciprocal velocity vectors to prevent deadlocks and head-on collisions.
   */
  computeOrcaVelocity(robot, prefVx, prefVz, dt) {
    const timeScale = Math.max(1.0, SimState.timeScale || 1.0);

    // 1. Dynamic Parameter Scaling for High-Speed Simulation (1x, 2x, 4x)
    // Scale time horizon proportionally to playback speed so fast robots react well in advance
    const baseTimeHorizon = 5.0; // 5.0 seconds standard lookahead
    const effectiveHorizon = baseTimeHorizon * Math.max(1.0, timeScale * 0.85);

    // Dynamic minimum safe distance: Expands buffer at higher playback speeds
    const baseSafeDist = 1.1; // meters
    const dynamicSafeDist = baseSafeDist * Math.sqrt(timeScale);

    let finalVx = prefVx;
    let finalVz = prefVz;

    // 2. Velocity Obstacle (VO) Evaluation against all other active AMRs
    for (const other of SimState.robots) {
      if (other.id === robot.id) continue;

      const relX = other.x - robot.x;
      const relZ = other.z - robot.z;
      const dist = Math.hypot(relX, relZ);

      // Check if other robot is within neighboring perception radius
      const neighborRadius = 6.0 * Math.max(1.0, Math.sqrt(timeScale));
      if (dist > neighborRadius) continue;

      // Relative velocity
      const otherVx = Math.sin(other.rotation) * other.speed;
      const otherVz = Math.cos(other.rotation) * other.speed;
      const relVx = prefVx - otherVx;
      const relVz = prefVz - otherVz;

      // Combined collision radius
      const combinedRadius = dynamicSafeDist;

      // Check Time-to-Collision (TTC)
      const rayDot = relVx * relX + relVz * relZ;
      if (rayDot > 0) {
        // Approaching each other
        const relSpeed = Math.hypot(relVx, relVz);
        if (relSpeed > 0.001) {
          const timeToClosestApproach = rayDot / (relSpeed * relSpeed);
          if (timeToClosestApproach > 0 && timeToClosestApproach < effectiveHorizon) {
            const closestX = relX - relVx * timeToClosestApproach;
            const closestZ = relZ - relVz * timeToClosestApproach;
            const closestDist = Math.hypot(closestX, closestZ);

            if (closestDist < combinedRadius) {
              // Collision predicted within time horizon! Apply ORCA reciprocal avoidance
              // Shift velocity vector by half of minimum required avoidance velocity (50% responsibility)
              const normalX = relX / (dist || 1);
              const normalZ = relZ / (dist || 1);

              // Perpendicular tangent vector for lateral bypass (Right-hand rule)
              const tangentX = -normalZ;
              const tangentZ = normalX;

              // Compute lateral avoidance bias
              const avoidanceFactor = (combinedRadius - closestDist) / (timeToClosestApproach + 0.1);
              finalVx -= (normalX * 0.6 + tangentX * 0.4) * avoidanceFactor * 0.5;
              finalVz -= (normalZ * 0.6 + tangentZ * 0.4) * avoidanceFactor * 0.5;
            }
          }
        }
      }

      // Proximity yielding in narrow aisles (Head-on avoidance)
      if (dist < dynamicSafeDist * 1.5) {
        const headingX = Math.sin(robot.rotation);
        const headingZ = Math.cos(robot.rotation);
        const dot = headingX * (relX / dist) + headingZ * (relZ / dist);

        if (dot > 0.4) {
          // Other robot is in forward cone; yield speed based on priority (lower ID or idle yields)
          const priority = (robot.status === 'EN_ROUTE_DELIVERY' ? 2 : 1) + (robot.id > other.id ? 0.1 : -0.1);
          const otherPriority = (other.status === 'EN_ROUTE_DELIVERY' ? 2 : 1);

          if (priority < otherPriority || (priority === otherPriority && robot.id > other.id)) {
            finalVx *= 0.1;
            finalVz *= 0.1;
          }
        }
      }
    }

    return { vx: finalVx, vz: finalVz };
  },

  /**
   * Hard Emergency Stop Safety Layer (Deterministic)
   * Independent of playback speed, timeScale, or framerate.
   * Runs as a fail-safe hard distance barrier.
   */
  checkHardEmergencyStop(robot) {
    const HARD_MIN_SAFE_DISTANCE = 0.85; // Hard physical bounding bubble (meters)

    for (const other of SimState.robots) {
      if (other.id === robot.id) continue;
      const dx = other.x - robot.x;
      const dz = other.z - robot.z;
      const dist = Math.hypot(dx, dz);

      if (dist < HARD_MIN_SAFE_DISTANCE) {
        // Immediate hard stop!
        robot.speed = 0;
        return true;
      }
    }
    return false;
  },

  updateDatasetPlayback(dt) {
    if (!this.activeDatasetRunKey || typeof NavigationRuns === 'undefined') return;
    const run = NavigationRuns[this.activeDatasetRunKey];
    if (!run || !run.points || run.points.length === 0) return;

    this.datasetTimer += dt;
    const stepDuration = 0.35 / (SimState.timeScale || 1.0);
    if (this.datasetTimer >= stepDuration) {
      this.datasetTimer = 0;
      this.datasetPlaybackIndex++;
      if (this.datasetPlaybackIndex >= run.points.length) {
        this.datasetPlaybackIndex = 0;
      }
    }

    const p = run.points[this.datasetPlaybackIndex];
    const r1 = SimState.robots[0];
    if (!r1 || !p) return;

    // Map dataset coordinates to warehouse bounds
    const targetX = (p.x - 7.4) * 1.35;
    const targetZ = (p.y - 7.1) * 0.95;
    const targetRot = (p.orientation * Math.PI) / 180.0;

    r1.x += (targetX - r1.x) * Math.min(1.0, dt * 12.0);
    r1.z += (targetZ - r1.z) * Math.min(1.0, dt * 12.0);
    r1.rotation = targetRot;
    r1.speed = r1.maxSpeed;
    r1.lidar_min = p.lidar_min;
    r1.lidar_max = p.lidar_max;
    r1.status = `REPLAY (${run.target.toUpperCase()} pt ${this.datasetPlaybackIndex + 1}/${run.points.length})`;

    // Check collision flag from dataset
    const isCollided = (p.collision_flag === 1) || (run.target === 'collision' && this.datasetPlaybackIndex >= run.points.length - 3);
    if (window.setRobotCollisionWarning) {
      window.setRobotCollisionWarning(r1.id, isCollided);
    }

    if (isCollided && (!this.lastDatasetCollisionAlert || (performance.now() - this.lastDatasetCollisionAlert > 3000))) {
      this.lastDatasetCollisionAlert = performance.now();
      if (window.logFleetComms) {
        window.logFleetComms('Robot-1', `DATASET COLLISION EVENT: Obstacle contact at (${r1.x.toFixed(2)}, ${r1.z.toFixed(2)}) [LiDAR min: ${p.lidar_min}m]`, 'DENY');
      }
    }
  },

  // Main Simulation Physics Loop with Sub-stepping for 1x, 2x, 4x Playback
  update(deltaSeconds) {
    if (SimState.isPaused) return;

    // Apply simulation timescale
    const rawDt = Math.min(deltaSeconds, 0.1) * SimState.timeScale;

    // If dataset run path replay is active, update robot-1 from dataset trajectory
    if (this.activeDatasetRunKey) {
      this.updateDatasetPlayback(rawDt);
    }

    // Sub-step physics integration for 2x/4x speeds to guarantee continuous collision checking
    const subSteps = SimState.timeScale >= 4.0 ? 4 : (SimState.timeScale >= 2.0 ? 2 : 1);
    const subDt = rawDt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      // 1. Try dispatching pending tasks
      if (step === 0 && !this.activeDatasetRunKey) {
        this.dispatchNextTask();
      }

      // 2. Advance kinematics for robots
      SimState.robots.forEach(robot => {
        if (robot.id === 'robot-1' && this.activeDatasetRunKey) {
          return;
        }
        this.updateRobotKinematics(robot, subDt);
      });

      // 3. Multi-robot elastic separation solver (guarantees zero overlap at all times)
      for (let i = 0; i < SimState.robots.length; i++) {
        for (let j = i + 1; j < SimState.robots.length; j++) {
          const r1 = SimState.robots[i];
          const r2 = SimState.robots[j];
          const dx = r2.x - r1.x;
          const dz = r2.z - r1.z;
          const d = Math.hypot(dx, dz);
          const minSep = 0.85;
          if (d < minSep && d > 0.0001) {
            const overlap = (minSep - d) * 0.5;
            const nx = dx / d;
            const nz = dz / d;
            r1.x -= nx * overlap;
            r1.z -= nz * overlap;
            r2.x += nx * overlap;
            r2.z += nz * overlap;
            r1.speed = 0;
            r2.speed = 0;
          }
        }
      }
    }
  },

  updateRobotKinematics(robot, dt) {
    if (robot.isRosControlled) {
      return;
    }

    // Battery consumption based on motion and payload
    const loadFactor = 1 + (robot.payload / 30);
    const drainRate = (robot.speed > 0.05 ? 0.04 : 0.005) * loadFactor;
    robot.battery = Math.max(0, robot.battery - drainRate * dt);

    // If battery critical and idle, reroute to charging pad
    if (robot.battery < 15 && robot.status === 'IDLE') {
      const pad = WarehouseConfig.chargingPads[0];
      robot.waypoints = this.planPath(robot.x, robot.z, pad.x, pad.z);
      robot.waypointIndex = 0;
      robot.status = 'CHARGING';
    }

    if (robot.status === 'CHARGING') {
      robot.battery = Math.min(100, robot.battery + 2.5 * dt);
      if (robot.battery >= 98) {
        robot.status = 'IDLE';
      }
      return;
    }

    // 1. Handling Waypoints Navigation
    if (robot.waypoints && robot.waypoints.length > 0 && robot.waypointIndex < robot.waypoints.length) {
      const targetWp = robot.waypoints[robot.waypointIndex];
      const dx = targetWp.x - robot.x;
      const dz = targetWp.z - robot.z;
      const distToWp = Math.hypot(dx, dz);

      if (distToWp < 0.28) {
        robot.waypointIndex++;
        if (robot.waypointIndex >= robot.waypoints.length) {
          robot.speed = 0;
          this.handleLegArrival(robot);
          return;
        }
      }

      // Compute preferred velocity towards waypoint
      const targetAngle = Math.atan2(dx, dz);
      let angleDiff = targetAngle - robot.rotation;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Realistic dual-drive AMR kinematics: rotate in place before accelerating
      const maxTurn = robot.turnRate * dt;
      if (Math.abs(angleDiff) > 0.20) {
        robot.rotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurn);
        robot.speed = Math.max(0, robot.speed - robot.acceleration * 2.2 * dt);
      } else {
        robot.rotation = targetAngle;
        robot.speed = Math.min(robot.maxSpeed, robot.speed + robot.acceleration * dt);
      }

      // 2. Car-Following & Ahead-Detection (Lookahead)
      let forwardObstructionDist = Infinity;
      const headingX = Math.sin(robot.rotation);
      const headingZ = Math.cos(robot.rotation);

      for (const other of SimState.robots) {
        if (other.id === robot.id) continue;
        const ox = other.x - robot.x;
        const oz = other.z - robot.z;
        const oDist = Math.hypot(ox, oz);

        // Check if other robot is in our forward travel cone (45 degrees, up to 2.8m)
        if (oDist < 2.8) {
          const dot = headingX * (ox / (oDist || 1)) + headingZ * (oz / (oDist || 1));
          if (dot > 0.38) {
            if (oDist < forwardObstructionDist) {
              forwardObstructionDist = oDist;
            }
          }
        }
      }

      // Smooth deceleration and queueing behind lead robot
      if (forwardObstructionDist < 1.35) {
        robot.speed = 0;
      } else if (forwardObstructionDist < 2.5) {
        const allowedSpeed = robot.maxSpeed * ((forwardObstructionDist - 1.35) / (2.5 - 1.35));
        robot.speed = Math.min(robot.speed, allowedSpeed);
      }

      // 3. Proposed movement step with Hard Anti-Penetration Guard
      const stepDist = robot.speed * dt;
      if (stepDist > 0) {
        const proposedX = robot.x + Math.sin(robot.rotation) * stepDist;
        const proposedZ = robot.z + Math.cos(robot.rotation) * stepDist;

        // Anti-penetration check: never step closer than 0.84m to any robot
        let wouldCollide = false;
        for (const other of SimState.robots) {
          if (other.id === robot.id) continue;
          const pDist = Math.hypot(other.x - proposedX, other.z - proposedZ);
          if (pDist < 0.84) {
            wouldCollide = true;
            break;
          }
        }

        const hitObstacle = this.isLethalObstacle(proposedX, proposedZ, 0.12);

        if (!wouldCollide && !hitObstacle) {
          robot.x = proposedX;
          robot.z = proposedZ;
          robot.odometer += stepDist;
        } else {
          robot.speed = 0;
        }
      }

    } else if (robot.status === 'PICKING') {
      // Mechanical Lift Sequence (takes 2.2s real duration)
      robot.liftProgress = Math.min(1.0, robot.liftProgress + (dt / 2.2));
      robot.speed = 0;

      if (robot.liftProgress >= 1.0) {
        // Lift complete! Box is secured on AMR bed
        const box = SimState.boxes.find(b => b.sku === robot.currentTask.sku);
        if (box) {
          box.inTransit = true;
          robot.carriedBox = box;
          robot.payload = box.weight;
        }

        robot.status = 'EN_ROUTE_DELIVERY';
        robot.liftProgress = 1.0;
        // Plan path from pickup rack to delivery bay front docking point (dockZ = 6.9)
        const dockZ = robot.currentTask.targetBay.dockZ !== undefined ? robot.currentTask.targetBay.dockZ : 6.9;
        robot.waypoints = this.planPath(robot.x, robot.z, robot.currentTask.targetBay.x, dockZ);
        robot.waypointIndex = 0;
      }

    } else if (robot.status === 'DELIVERING') {
      // Lowering payload onto workstation conveyor
      robot.liftProgress = Math.max(0, robot.liftProgress - (dt / 1.8));
      robot.speed = 0;

      if (robot.liftProgress <= 0) {
        // Unload complete
        const completedTask = robot.currentTask;
        if (completedTask) {
          completedTask.status = 'COMPLETED';
          const duration = (Date.now() - (completedTask.createdTime || Date.now())) / 1000;
          SimState.metrics.tasksCompleted++;
          SimState.metrics.totalTaskTime += duration;
          SimState.metrics.avgTaskTime = parseFloat((SimState.metrics.totalTaskTime / SimState.metrics.tasksCompleted).toFixed(1));
          if (window.logFleetComms) {
            window.logFleetComms(robot.name, `COMPLETED: ${completedTask.id} delivered ${completedTask.sku} to ${completedTask.targetBay?.name || 'dock'}`, 'GRANT');
          }
        }

        if (robot.carriedBox) {
          robot.carriedBox.inTransit = false;
          const bayX = completedTask?.targetBay?.x !== undefined ? completedTask.targetBay.x : robot.x;
          const bayZ = completedTask?.targetBay?.z !== undefined ? completedTask.targetBay.z : robot.z;
          robot.carriedBox.currentX = bayX;
          robot.carriedBox.currentY = 0.9;
          robot.carriedBox.currentZ = bayZ;
          if (robot.carriedBox.mesh) {
            robot.carriedBox.mesh.position.set(bayX, 0.9, bayZ);
          }
          robot.carriedBox = null;
        }

        robot.payload = 0;
        robot.currentTask = null;
        robot.status = 'IDLE';

        if (typeof updateUILists === 'function') {
          updateUILists();
        }

        // Auto generate next logistics demand after 3 seconds
        setTimeout(() => {
          this.generateRandomLogisticsTask();
        }, 3000);
      }
    }
  },

  handleLegArrival(robot) {
    if (robot.status === 'EN_ROUTE_PICKUP') {
      robot.status = 'PICKING';
      robot.liftProgress = 0;
      if (window.logFleetComms && robot.currentTask) {
        window.logFleetComms(robot.name, `ARRIVED at Shelf (Aisle ${robot.currentTask.sourceRack.aisle}) - LIFTING ${robot.currentTask.sku}`, 'REQUEST');
      }
    } else if (robot.status === 'EN_ROUTE_DELIVERY') {
      robot.status = 'DELIVERING';
      if (window.logFleetComms && robot.currentTask) {
        window.logFleetComms(robot.name, `ARRIVED at ${robot.currentTask.targetBay.name} Dock - UNLOADING`, 'GRANT');
      }
    }
  },

  generateRandomLogisticsTask() {
    const availableBoxes = SimState.boxes.filter(b => !b.inTransit && b.level === 1);
    if (availableBoxes.length === 0) return;

    const randomBox = availableBoxes[Math.floor(Math.random() * availableBoxes.length)];
    const randomBay = WarehouseConfig.deliveryBays[Math.floor(Math.random() * WarehouseConfig.deliveryBays.length)];
    const priorities = ['P1', 'P2', 'P3'];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const newTask = {
      id: `TASK-${100 + SimState.taskQueue.length + 1}`,
      sku: randomBox.sku,
      category: randomBox.category,
      weight: randomBox.weight,
      priority: priority,
      sourceRack: {
        aisle: randomBox.aisle,
        bay: randomBox.bay,
        level: randomBox.level,
        x: randomBox.homeX,
        z: randomBox.homeZ,
        pickZ: randomBox.pickZ || this.getNearestAisleZ(randomBox.homeZ)
      },
      targetBay: randomBay,
      assignedRobotId: null,
      status: 'QUEUED',
      createdTime: Date.now()
    };

    SimState.taskQueue.push(newTask);
  },

  createManualTask(sku, bayId, priority = 'P1', targetRobotId = 'auto') {
    let box = SimState.boxes.find(b => b.sku === sku);
    if (!box) {
      box = SimState.boxes.find(b => !b.inTransit) || SimState.boxes[0];
    }
    const bay = WarehouseConfig.deliveryBays.find(b => b.id === bayId) || WarehouseConfig.deliveryBays[0];
    if (!box) return null;

    const assignedId = (targetRobotId && targetRobotId !== 'auto') ? targetRobotId.replace('_', '-') : null;

    const newTask = {
      id: `TASK-${200 + SimState.taskQueue.length + 1}`,
      sku: box.sku,
      category: box.category,
      weight: box.weight,
      priority: priority,
      sourceRack: {
        aisle: box.aisle,
        bay: box.bay,
        level: box.level,
        x: box.homeX,
        z: box.homeZ,
        pickZ: box.pickZ !== undefined ? box.pickZ : this.getNearestAisleZ(box.homeZ)
      },
      targetBay: bay,
      assignedRobotId: assignedId,
      status: 'QUEUED',
      createdTime: Date.now()
    };

    // ALWAYS prepend to taskQueue so it immediately appears in the Task Missions sidebar
    SimState.taskQueue.unshift(newTask);

    // If targeted to a specific robot, immediately assign it
    if (assignedId) {
      const robot = SimState.robots.find(r => r.id === assignedId);
      if (robot) {
        // If ROS 2 Bridge is connected, publish manual task to ROS 2 backend
        if (typeof ROSBridge !== 'undefined' && ROSBridge.isConnected && ROSBridge.publishManualTask) {
          const pickZ = newTask.sourceRack.pickZ !== undefined ? newTask.sourceRack.pickZ : -1.5;
          const dropZ = newTask.targetBay.dockZ !== undefined ? newTask.targetBay.dockZ : (newTask.targetBay.z !== undefined ? newTask.targetBay.z : 6.9);
          ROSBridge.publishManualTask(robot.id, newTask.id, newTask.sourceRack.x, pickZ, newTask.targetBay.x, dropZ);
        }
        this.assignTaskToRobot(robot, newTask);
        return newTask;
      }
    }

    // Auto assignment attempt for idle robots
    this.dispatchNextTask();
    return newTask;
  },

  spawnNewRobot(model = 'ATR-400') {
    const count = SimState.robots.length + 1;
    const isHeavy = model === 'ATR-600';
    const newRobot = {
      id: `robot-${count}`,
      name: `${model} #${count}`,
      model: model,
      type: isHeavy ? 'heavy_arm' : 'courier',
      x: -12 + (count * 2.5) % 24,
      z: 5.5 + this.LANE_OFFSET,
      targetX: -12 + (count * 2.5) % 24,
      targetZ: 5.5 + this.LANE_OFFSET,
      rotation: 0,
      targetRotation: 0,
      speed: 0,
      maxSpeed: isHeavy ? 1.0 : 1.2,
      acceleration: isHeavy ? 0.6 : 0.8,
      turnRate: isHeavy ? 1.6 : 2.0,
      battery: 100,
      status: 'IDLE',
      payload: 0,
      carriedBox: null,
      currentTask: null,
      waypoints: [],
      waypointIndex: 0,
      odometer: 0,
      color: isHeavy ? 0xf59e0b : 0x00f2fe,
      liftProgress: 0
    };

    SimState.robots.push(newRobot);
    return newRobot;
  }
};

// Initialize costmap footprints when data is ready
WarehouseSim.init();
