/**
 * ROS 2 Bridge WebSocket Client via roslib.js
 * Connects to rosbridge_websocket server at ws://localhost:9090
 * Subscribes to:
 * - /robot_N/fleet/pose (fleet_msgs/RobotPose)
 * - /fleet/comms_log (fleet_msgs/CommsLog)
 * - /fleet/intersection_reservations (fleet_msgs/IntersectionReservation)
 * - /fleet/task_bids (fleet_msgs/TaskBid)
 * - /fleet/blocked_aisles (fleet_msgs/BlockedAisle)
 * Updates Three.js robot meshes and displays live P2P Fleet Comms feed in real-time
 */

const ROSBridge = {
  ros: null,
  isConnected: false,
  url: 'ws://localhost:9090',
  subscribers: {},
  reconnectInterval: null,
  maxLogEntries: 120,

  init() {
    this.setupCommsUI();

    if (typeof ROSLIB === 'undefined') {
      console.warn('[ROS2 Bridge] roslib.js not loaded. Retrying in 1s...');
      setTimeout(() => this.init(), 1000);
      return;
    }

    this.connect();
  },

  setupCommsUI() {
    const clearBtn = document.getElementById('btn-clear-comms');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const feed = document.getElementById('fleet-comms-feed');
        if (feed) feed.innerHTML = '';
      });
    }

    const fullClearBtn = document.getElementById('btn-fullscreen-clear');
    if (fullClearBtn) {
      fullClearBtn.addEventListener('click', () => {
        const feed = document.getElementById('fullscreen-chat-feed');
        if (feed) feed.innerHTML = '';
      });
    }

    // Fullscreen comms filter buttons
    document.querySelectorAll('.comms-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.comms-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        const feed = document.getElementById('fullscreen-chat-feed');
        if (!feed) return;
        Array.from(feed.children).forEach(child => {
          if (filter === 'all' || child.getAttribute('data-category') === filter) {
            child.style.display = 'flex';
          } else {
            child.style.display = 'none';
          }
        });
      });
    });

    // Seed initial system boot log
    this.appendCommsLog('SYSTEM', 'P2P Decentralized Comms Protocol Online', 'INFO', 'INFO');

    // Start streaming parsed telemetry from robot_interaction_dataset.csv
    this.startRobotInteractionFeed();
  },

  /**
   * Streams live Comm Type, Latency, and Packet Loss from robot_interaction_dataset.csv
   */
  startRobotInteractionFeed() {
    if (typeof RobotInteractions === 'undefined' || !Array.isArray(RobotInteractions) || RobotInteractions.length === 0) {
      return;
    }

    let index = 0;
    setInterval(() => {
      // Pick next interaction record
      const r = RobotInteractions[index % RobotInteractions.length];
      index++;

      // Color coding & badge mapping based on Latency & Packet Loss:
      // Green (GRANT): Clean link (Loss < 0.5%, Latency < 50ms)
      // Yellow (REQUEST): Moderate latency (50-80ms or Loss 0.5-1.2%)
      // Red (DENY): Degraded link (Loss > 1.2% or Latency > 80ms)
      let type = 'BID';
      if (r.packet_loss >= 1.2 || r.latency_ms >= 85.0) {
        type = 'DENY';
      } else if (r.latency_ms < 45.0 && r.packet_loss < 0.5) {
        type = 'GRANT';
      } else if (r.comm_type.includes('Robot-to-Robot')) {
        type = 'REQUEST';
      }

      const content = `${r.comm_type} | Latency: ${r.latency_ms}ms | Loss: ${r.packet_loss}% | Jitter: ${r.jitter_ms}ms (${r.task_type})`;
      this.appendCommsLog(r.robot_id, content, type);
    }, 2200);
  },

  connect() {
    console.log(`[ROS2 Bridge] Connecting to ROS 2 bridge at ${this.url}...`);
    this.updateStatusUI('CONNECTING', '#f59e0b');

    this.ros = new ROSLIB.Ros({
      url: this.url
    });

    // Event: Connected
    this.ros.on('connection', () => {
      console.log('[ROS2 Bridge] Connected successfully to ROS 2 bridge!');
      this.isConnected = true;
      this.updateStatusUI('CONNECTED (ws://localhost:9090)', '#10b981');
      this.appendCommsLog('SYSTEM', 'Connected to ROS 2 Bridge (ws://localhost:9090)', 'GRANT', 'SUCCESS');
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
      this.setupSubscribers();
    });

    // Event: Error
    this.ros.on('error', (error) => {
      console.warn('[ROS2 Bridge] Connection error:', error);
      this.isConnected = false;
      this.updateStatusUI('DISCONNECTED (STANDALONE SIM)', '#64748b');
      this.scheduleReconnect();
    });

    // Event: Closed
    this.ros.on('close', () => {
      console.log('[ROS2 Bridge] Connection closed.');
      this.isConnected = false;
      this.updateStatusUI('DISCONNECTED (STANDALONE SIM)', '#64748b');
      this.scheduleReconnect();
    });
  },

  scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        if (!this.isConnected) {
          console.log('[ROS2 Bridge] Attempting reconnect...');
          this.connect();
        }
      }, 5000);
    }
  },

  updateStatusUI(statusText, colorHex) {
    const statusPill = document.getElementById('ros2-status-text');
    const pulseDot = document.getElementById('ros2-pulse-dot');
    const commsMeta = document.getElementById('sidebar-comms-status');

    if (statusPill) {
      statusPill.textContent = `ROS 2: ${statusText}`;
      statusPill.style.color = colorHex;
    }
    if (pulseDot) {
      pulseDot.style.background = colorHex;
      pulseDot.style.boxShadow = `0 0 8px ${colorHex}`;
    }
    if (commsMeta) {
      commsMeta.textContent = this.isConnected ? 'ROS 2 LIVE' : 'SIMULATION';
      commsMeta.style.color = colorHex;
    }
  },

  setupSubscribers() {
    // 1. Robot Pose Subscribers (/robot_N/fleet/pose)
    const robotConfigs = [
      { id: 'robot-1', index: 0, topic: '/robot_1/fleet/pose' },
      { id: 'robot-2', index: 1, topic: '/robot_2/fleet/pose' },
      { id: 'robot-3', index: 2, topic: '/robot_3/fleet/pose' }
    ];

    robotConfigs.forEach(cfg => {
      const topicSub = new ROSLIB.Topic({
        ros: this.ros,
        name: cfg.topic,
        messageType: 'fleet_msgs/RobotPose'
      });

      topicSub.subscribe((message) => {
        this.handlePoseMessage(cfg.id, cfg.index, message);
      });

      this.subscribers[cfg.id] = topicSub;
      console.log(`[ROS2 Bridge] Subscribed to ${cfg.topic}`);
    });

    // 2. Unified Comms Log Topic (/fleet/comms_log)
    const commsLogSub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/fleet/comms_log',
      messageType: 'fleet_msgs/CommsLog'
    });

    commsLogSub.subscribe((msg) => {
      this.appendCommsLog(
        msg.robot_id || 'FLEET',
        msg.content || '',
        msg.msg_type || 'INFO',
        msg.status_level || 'INFO'
      );
    });
    this.subscribers['comms_log'] = commsLogSub;

    // 3. Intersection Reservations Topic (/fleet/intersection_reservations)
    const reservationSub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/fleet/intersection_reservations',
      messageType: 'fleet_msgs/IntersectionReservation'
    });

    reservationSub.subscribe((msg) => {
      let type = msg.request_type || 'REQUEST';
      let content = `${type}ED Intersection ${msg.intersection_id || 'A'}`;
      if (type === 'GRANT') content = `GRANTED Intersection ${msg.intersection_id || 'A'}`;
      if (type === 'DENY') content = `DENIED Intersection ${msg.intersection_id || 'A'}`;
      if (type === 'RELEASE') content = `RELEASED Intersection ${msg.intersection_id || 'A'}`;
      this.appendCommsLog(msg.robot_id || 'Robot', content, type);
    });
    this.subscribers['reservations'] = reservationSub;

    // 4. Task Bids Auction Topic (/fleet/task_bids)
    const taskBidSub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/fleet/task_bids',
      messageType: 'fleet_msgs/TaskBid'
    });

    taskBidSub.subscribe((msg) => {
      const cost = msg.bid_amount !== undefined ? `$${msg.bid_amount.toFixed(2)}` : 'bid';
      const content = `BID ${cost} for Task ${msg.task_id || 'X'}`;
      this.appendCommsLog(msg.robot_id || 'Robot', content, 'BID');
    });
    this.subscribers['task_bids'] = taskBidSub;

    // 5. Blocked Aisle Alerts Topic (/fleet/blocked_aisles)
    const blockedAisleSub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/fleet/blocked_aisles',
      messageType: 'fleet_msgs/BlockedAisle'
    });

    blockedAisleSub.subscribe((msg) => {
      const content = `BROADCAST Blocked Aisle ${msg.aisle_id || 'Unknown'} (${msg.severity || 'WARNING'})`;
      this.appendCommsLog(msg.reporter_id || 'Robot', content, 'BLOCKED');
    });
    this.subscribers['blocked_aisles'] = blockedAisleSub;

    // 6. Safety Events Stream (/fleet/safety_events)
    const safetySub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/fleet/safety_events',
      messageType: 'std_msgs/String'
    });
    safetySub.subscribe((msg) => {
      this.appendCommsLog('SAFETY-LAYER', msg.data, 'DENY');
    });
    this.subscribers['safety_events'] = safetySub;

    // 7. Battery Status Subscribers (/robot_N/fleet/battery)
    ['robot_1', 'robot_2', 'robot_3'].forEach(rName => {
      const simId = rName.replace('_', '-');
      const battSub = new ROSLIB.Topic({
        ros: this.ros,
        name: `/${rName}/fleet/battery`,
        messageType: 'fleet_msgs/BatteryStatus'
      });
      battSub.subscribe((msg) => {
        const r = SimState.robots.find(item => item.id === simId);
        if (r && msg.percentage !== undefined) {
          r.battery = Math.round(msg.percentage);
        }
      });
      this.subscribers[`batt_${rName}`] = battSub;
    });
  },

  /**
   * Appends an entry into the Fleet Comms live feed with timestamp and color coding
   * @param {string} robotId - e.g., "Robot-1" or "ATR-400 #1"
   * @param {string} text - Message text e.g., "REQUESTED Intersection A"
   * @param {string} type - "REQUEST", "GRANT", "DENY", "BID", "BLOCKED", "RELEASE", "INFO"
   * @param {string} [level] - Optional status level override
   */
  appendCommsLog(robotId, text, type = 'INFO', level = null) {
    const feed = document.getElementById('fleet-comms-feed');
    const fullFeed = document.getElementById('fullscreen-chat-feed');

    // Timestamp: HH:MM:SS.mmm
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;

    const normalizedType = type ? type.toUpperCase() : 'INFO';
    let entryClass = 'comms-entry-info';
    let badgeClass = 'comms-badge-bid';
    let textClass = 'comms-text-info';
    let category = 'P2P';

    if (normalizedType.includes('GRANT') || normalizedType === 'SUCCESS') {
      entryClass = 'comms-entry-grant';
      badgeClass = 'comms-badge-grant';
      textClass = 'comms-text-grant';
      category = 'TASK';
    } else if (normalizedType.includes('REQUEST') || normalizedType === 'PENDING') {
      entryClass = 'comms-entry-request';
      badgeClass = 'comms-badge-request';
      textClass = 'comms-text-request';
      category = 'TASK';
    } else if (normalizedType.includes('DENY') || normalizedType.includes('FAIL') || normalizedType === 'ERROR') {
      entryClass = 'comms-entry-deny';
      badgeClass = 'comms-badge-deny';
      textClass = 'comms-text-deny';
      category = 'SAFETY';
    } else if (normalizedType.includes('BID') || normalizedType.includes('AUCTION') || normalizedType.includes('TASK')) {
      entryClass = 'comms-entry-bid';
      badgeClass = 'comms-badge-bid';
      textClass = 'comms-text-bid';
      category = 'TASK';
    } else if (normalizedType.includes('BLOCK') || normalizedType.includes('ALERT') || normalizedType === 'WARNING') {
      entryClass = 'comms-entry-alert';
      badgeClass = 'comms-badge-alert';
      textClass = 'comms-text-alert';
      category = 'SAFETY';
    } else if (normalizedType.includes('REROUTE') || text.includes('REVERS') || text.includes('COLLISION')) {
      entryClass = 'comms-entry-deny';
      badgeClass = 'comms-badge-deny';
      textClass = 'comms-text-deny';
      category = 'COLLISION';
    } else if (robotId === 'OPERATOR') {
      category = 'OPERATOR';
    }

    // Format robot ID cleanly (e.g. Robot-1, Robot-2, Robot-3)
    let formattedRobotId = robotId;
    if (robotId.startsWith('robot-') || robotId.startsWith('robot_')) {
      const num = robotId.replace('robot-', '').replace('robot_', '');
      formattedRobotId = `Robot-${num}`;
    }

    // 1. Append to sidebar feed
    if (feed) {
      const logRow = document.createElement('div');
      logRow.className = `comms-log-entry ${entryClass}`;
      logRow.setAttribute('data-category', category);
      logRow.innerHTML = `
        <span class="comms-time">[${timeStr}]</span>
        <span class="comms-robot-tag">[${formattedRobotId}]</span>
        <span class="comms-type-badge ${badgeClass}">${normalizedType}</span>
        <span class="comms-msg-text ${textClass}">${text}</span>
      `;
      feed.appendChild(logRow);
      while (feed.children.length > this.maxLogEntries) {
        feed.removeChild(feed.firstChild);
      }
      feed.scrollTop = feed.scrollHeight;
    }

    // 2. Append to Fullscreen Chat Feed
    if (fullFeed) {
      const chatCard = document.createElement('div');
      chatCard.setAttribute('data-category', category);
      chatCard.style.padding = '8px 12px';
      chatCard.style.borderRadius = '6px';
      chatCard.style.background = 'rgba(16, 23, 38, 0.7)';
      chatCard.style.border = '1px solid rgba(56, 189, 248, 0.15)';
      chatCard.style.display = 'flex';
      chatCard.style.gap = '10px';
      chatCard.style.alignItems = 'flex-start';
      chatCard.style.fontSize = '12px';

      // Pick avatar color
      let avatarIcon = '🤖';
      let avatarColor = '#00f2fe';
      if (formattedRobotId.includes('1')) { avatarColor = '#00f2fe'; }
      else if (formattedRobotId.includes('2')) { avatarColor = '#38bdf8'; }
      else if (formattedRobotId.includes('3')) { avatarColor = '#f59e0b'; }
      else if (robotId === 'SAFETY-LAYER' || category === 'COLLISION') { avatarIcon = '🛡️'; avatarColor = '#ef4444'; }
      else if (robotId === 'OPERATOR') { avatarIcon = '👤'; avatarColor = '#10b981'; }
      else { avatarIcon = '🌐'; avatarColor = '#8b5cf6'; }

      chatCard.innerHTML = `
        <div style="font-size: 18px; line-height: 1;">${avatarIcon}</div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
            <strong style="color: ${avatarColor};">${formattedRobotId}</strong>
            <span style="font-size: 10px; color: var(--text-dim);">[${timeStr}]</span>
            <span class="comms-type-badge ${badgeClass}" style="font-size: 9px; padding: 1px 6px;">${normalizedType}</span>
          </div>
          <div style="color: #f1f5f9; line-height: 1.4;">${text}</div>
        </div>
      `;

      fullFeed.appendChild(chatCard);
      while (fullFeed.children.length > 250) {
        fullFeed.removeChild(fullFeed.firstChild);
      }
      fullFeed.scrollTop = fullFeed.scrollHeight;
    }
  },

  handlePoseMessage(robotId, robotIndex, message) {
    const robot = SimState.robots.find(r => r.id === robotId || r.id === robotId.replace('_', '-'));
    if (!robot) return;

    robot.isRosControlled = true;

    const rawX = message.x !== undefined ? message.x : (message.pose ? message.pose.x : 0);
    const rawY = message.y !== undefined ? message.y : (message.pose ? message.pose.y : 0);
    const rawYaw = message.yaw !== undefined ? message.yaw : (message.theta !== undefined ? message.theta : (message.pose ? message.pose.yaw || 0 : 0));

    // =========================================================================
    // Visual Safety Net: Three.js Static Obstacle Collision Check
    // Checks if the new ROS 2 target pose collides with any static obstacle
    // (Tables, Docks, Shelves, Walls). If it collides:
    // 1. Do not move the robot mesh
    // 2. Turn its color to RED to indicate a collision warning
    // =========================================================================
    const collisionCheck = window.checkStaticObstacleIntersection ? window.checkStaticObstacleIntersection(rawX, 0, rawY, 0.42) : { collision: false };

    const now = performance.now();

    if (collisionCheck.collision) {
      // Turn AMR visual state to RED collision warning
      if (window.setRobotCollisionWarning) {
        window.setRobotCollisionWarning(robot.id, true);
      }

      // Log collision warning to Fleet Comms stream (debounced to once every 2.5s)
      if (window.logFleetComms && (!robot.lastCollisionLog || (now - robot.lastCollisionLog > 2500))) {
        window.logFleetComms(robot.name, `COLLISION BLOCKED: Attempted penetration into ${collisionCheck.name} at (${rawX.toFixed(2)}, ${rawY.toFixed(2)})`, 'DENY');
        robot.lastCollisionLog = now;
      }

      // ABORT mesh position update to prevent robot from driving underneath docks/shelves
      return;
    } else {
      // Position is clean - restore normal AMR color state
      if (window.setRobotCollisionWarning) {
        window.setRobotCollisionWarning(robot.id, false);
      }
    }

    const vel = message.velocity !== undefined ? message.velocity : (message.speed !== undefined ? message.speed : null);
    if (vel !== null) {
      robot.speed = Math.abs(vel);
      if (robot.lastRosTime) {
        const dx = rawX - robot.x;
        const dz = rawY - robot.z;
        robot.odometer += Math.hypot(dx, dz);
      }
    } else if (robot.lastRosTime) {
      const dt = (now - robot.lastRosTime) / 1000;
      if (dt > 0.01) {
        const dx = rawX - robot.x;
        const dz = rawY - robot.z;
        const computedSpeed = Math.hypot(dx, dz) / dt;
        robot.speed = computedSpeed;
        robot.odometer += Math.hypot(dx, dz);
      }
    }
    robot.lastRosTime = now;

    robot.x = rawX;
    robot.z = rawY;
    robot.rotation = rawYaw;

    if (message.battery !== undefined) robot.battery = Math.round(message.battery);
    if (message.status !== undefined && message.status) {
      robot.status = message.status;
    } else if (robot.speed > 0.08 && robot.status === 'IDLE') {
      robot.status = robot.carriedBox ? 'EN_ROUTE_DELIVERY' : 'EN_ROUTE_PICKUP';
    }
    if (message.payload !== undefined) robot.payload = message.payload;

    const mesh = typeof robotMeshes !== 'undefined' ? robotMeshes.get(robot.id) : null;
    if (mesh) {
      mesh.position.set(robot.x, 0, robot.z);
      mesh.rotation.y = robot.rotation;

      if (robot.carriedBox && robot.carriedBox.mesh) {
        robot.carriedBox.mesh.position.set(robot.x, 0.38 + (robot.liftProgress || 0) * 0.15, robot.z - 0.05);
        robot.carriedBox.mesh.rotation.y = robot.rotation;
      }
    }
  },

  cmdVelPublishers: {},

  publishCmdVel(robotId, linearX, angularZ) {
    if (!this.isConnected || !this.ros || typeof ROSLIB === 'undefined') return;
    const rosId = robotId.replace('-', '_');
    if (!this.cmdVelPublishers[rosId]) {
      this.cmdVelPublishers[rosId] = new ROSLIB.Topic({
        ros: this.ros,
        name: `/${rosId}/cmd_vel`,
        messageType: 'geometry_msgs/Twist'
      });
    }
    const twist = new ROSLIB.Message({
      linear: { x: linearX, y: 0.0, z: 0.0 },
      angular: { x: 0.0, y: 0.0, z: angularZ }
    });
    this.cmdVelPublishers[rosId].publish(twist);
  },

  manualTaskPub: null,

  publishManualTask(robotId, taskId, pickupX, pickupY, dropoffX, dropoffY) {
    if (!this.isConnected || !this.ros || typeof ROSLIB === 'undefined') return;
    const rosId = robotId.replace('-', '_');
    if (!this.manualTaskPub) {
      this.manualTaskPub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/fleet/manual_task_assignment',
        messageType: 'std_msgs/String'
      });
    }
    const payload = JSON.stringify({
      robot_id: rosId,
      task_id: taskId,
      pickup_x: pickupX,
      pickup_y: pickupY,
      dropoff_x: dropoffX,
      dropoff_y: dropoffY
    });
    const msg = new ROSLIB.Message({ data: payload });
    this.manualTaskPub.publish(msg);
  }
};

// Global helper for logging to Fleet Comms feed
window.logFleetComms = (robotId, text, type, level) => {
  ROSBridge.appendCommsLog(robotId, text, type, level);
};

// Initialize ROS 2 Bridge Client (supports both early and deferred loading)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ROSBridge.init();
  });
} else {
  ROSBridge.init();
}
