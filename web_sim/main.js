/**
 * Amazon Warehouse Logistics Digital Twin - Main Three.js Application
 * Renders photorealistic warehouse, structured racks, Amazon boxes, AMRs, 3D HUDs, and camera controllers
 */

let scene, camera, renderer, controls;
let robotMeshes = new Map(); // robot.id -> ThreeJS Group
let laserGuideLines = new Map(); // robot.id -> Line
let boxMeshes = new Map(); // box.id -> Mesh
let staticObstacleBoxes = []; // Array of { name, box: THREE.Box3 } for tables, docks, shelves, walls
let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

/**
 * Visual Safety Net: Bounding-box collision checker against all static obstacle meshes
 * (Tables, Conveyor Docks, Structured Shelves, Perimeter Walls)
 */
function checkStaticObstacleIntersection(x, y, z, robotRadius = 0.42) {
  const robotBox = new THREE.Box3(
    new THREE.Vector3(x - robotRadius, 0.02, z - robotRadius),
    new THREE.Vector3(x + robotRadius, 0.60, z + robotRadius)
  );

  for (const obstacle of staticObstacleBoxes) {
    if (robotBox.intersectsBox(obstacle.box)) {
      return { collision: true, name: obstacle.name, obstacleBox: obstacle.box };
    }
  }
  return { collision: false };
}
window.checkStaticObstacleIntersection = checkStaticObstacleIntersection;

/**
 * Updates AMR visual state on collision alert (turns chassis and LED ring red)
 */
function setRobotCollisionWarning(robotId, isColliding) {
  const mesh = robotMeshes.get(robotId);
  const robot = SimState.robots.find(r => r.id === robotId);
  if (!mesh || !robot) return;

  if (isColliding) {
    if (mesh.userData.ledRing) mesh.userData.ledRing.material.color.setHex(0xef4444);
    if (mesh.userData.chassis) mesh.userData.chassis.material.color.setHex(0xfca5a5);
    robot.hasVisualCollision = true;
  } else {
    if (mesh.userData.ledRing) mesh.userData.ledRing.material.color.setHex(robot.color || 0x00f2fe);
    if (mesh.userData.chassis) mesh.userData.chassis.material.color.setHex(0xf1f5f9);
    robot.hasVisualCollision = false;
  }
}
window.setRobotCollisionWarning = setRobotCollisionWarning;

// Camera Presets
const CAM_PRESETS = {
  overview: { pos: new THREE.Vector3(0, 22, 22), target: new THREE.Vector3(0, 1, 0) },
  topdown: { pos: new THREE.Vector3(0, 32, 0.1), target: new THREE.Vector3(0, 0, 0) },
  workstation: { pos: new THREE.Vector3(0, 7, 16), target: new THREE.Vector3(0, 1, 8.5) }
};

// Initialize Application
function init() {
  const container = document.getElementById('viewport-container');
  const canvas = document.getElementById('canvas3d');

  // 1. Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);
  scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

  // 2. Camera Setup
  camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.copy(CAM_PRESETS.overview.pos);

  // 3. Renderer Setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // 4. Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't dip below floor
  controls.minDistance = 2;
  controls.maxDistance = 50;
  controls.target.copy(CAM_PRESETS.overview.target);

  // 5. Lighting
  setupLighting();

  // 6. Build Warehouse Architecture
  buildWarehouseEnvironment();

  // 7. Build Structured Racks & Place Amazon Boxes
  buildStructuredRacks();

  // 8. Build Delivery Bays & Packing Workstations
  buildWorkstationsAndDocks();

  // 9. Build AMR Fleet Models
  buildAMRFleet();

  // 10. Setup DOM UI & Event Listeners
  setupEventListeners();
  updateUILists();

  // Window resize handler
  window.addEventListener('resize', onWindowResize);

  // Raycasting for clicking AMRs
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  // Start Animation Loop
  animate();
}

// ----------------------------------------------------
// Lighting Setup
// ----------------------------------------------------
function setupLighting() {
  // Ambient cool fill light
  const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.55);
  scene.add(ambientLight);

  // Main high-bay industrial overhead key light
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
  mainLight.position.set(10, 20, 10);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 1;
  mainLight.shadow.camera.far = 45;
  mainLight.shadow.camera.left = -18;
  mainLight.shadow.camera.right = 18;
  mainLight.shadow.camera.top = 15;
  mainLight.shadow.camera.bottom = -15;
  mainLight.shadow.bias = -0.0005;
  scene.add(mainLight);

  // Secondary soft directional fill
  const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
  fillLight.position.set(-15, 15, -10);
  scene.add(fillLight);

  // Linear overhead industrial LED luminaires along ceiling
  for (let z = -7; z <= 7; z += 4.5) {
    for (let x = -10; x <= 10; x += 10) {
      const ledLight = new THREE.PointLight(0xf8fafc, 0.45, 12, 1.8);
      ledLight.position.set(x, 6.2, z);
      scene.add(ledLight);
    }
  }
}

// ----------------------------------------------------
// Warehouse Floor, Walls & Overhead Infrastructure
// ----------------------------------------------------
function buildWarehouseEnvironment() {
  const { width, depth, wallHeight } = WarehouseConfig;

  // 1. Polished Epoxy Concrete Floor
  const floorGeo = new THREE.PlaneGeometry(width, depth);
  const floorTex = WarehouseTextures.createFloorTexture();
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.28,
    metalness: 0.15
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // 2. Concrete Perimeter Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.75,
    metalness: 0.1
  });

  // Back Wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.5), wallMat);
  backWall.position.set(0, wallHeight / 2, -depth / 2 - 0.25);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Left Wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, depth), wallMat);
  leftWall.position.set(-width / 2 - 0.25, wallHeight / 2, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Right Wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, depth), wallMat);
  rightWall.position.set(width / 2 + 0.25, wallHeight / 2, 0);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Overhead Steel Trusses and Linear LED Lighting Fixtures
  for (let z = -8; z <= 8; z += 4) {
    // Horizontal steel I-beam truss
    const truss = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.25, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 })
    );
    truss.position.set(0, 6.4, z);
    scene.add(truss);

    // Glowing LED luminaire strip hanging beneath truss
    const luminaire = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.7, 0.08, 0.15),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.8
      })
    );
    luminaire.position.set(0, 6.25, z);
    scene.add(luminaire);
  }

  // Aisle Overhead Navigation Signs
  const aisleSigns = [
    { text: 'AISLE 10', z: -6.5 },
    { text: 'AISLE 11', z: -3.5 },
    { text: 'AISLE 12', z: 0.5 },
    { text: 'AISLE 13', z: 3.5 }
  ];

  aisleSigns.forEach(as => {
    const signTex = WarehouseTextures.createSignTexture(as.text);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.65), signMat);
    signMesh.position.set(-11.5, 4.0, as.z);
    signMesh.rotation.y = Math.PI / 2;
    scene.add(signMesh);
  });

  // Register wall obstacle boxes
  staticObstacleBoxes.push({ name: 'Back Wall', box: new THREE.Box3(new THREE.Vector3(-width / 2, 0, -depth / 2 - 0.5), new THREE.Vector3(width / 2, wallHeight, -depth / 2)) });
  staticObstacleBoxes.push({ name: 'Left Wall', box: new THREE.Box3(new THREE.Vector3(-width / 2 - 0.5, 0, -depth / 2), new THREE.Vector3(-width / 2, wallHeight, depth / 2)) });
  staticObstacleBoxes.push({ name: 'Right Wall', box: new THREE.Box3(new THREE.Vector3(width / 2, 0, -depth / 2), new THREE.Vector3(width / 2 + 0.5, wallHeight, depth / 2)) });

  // 3. Render Mandatory Red Line Highway Route Network on Floor
  buildRedLineHighways();
}

/**
 * Visualizes the Two-Way Side-by-Side Highway Route Network on the warehouse floor.
 * Every aisle and vertical highway features dual parallel lanes:
 * - Eastbound / Northbound: Glowing Cyan Lane (0x00f2fe)
 * - Westbound / Southbound: Glowing Amber Lane (0xf59e0b)
 * - Center dashed divider line (0x64748b)
 * Robots in opposite directions travel side-by-side without colliding!
 */
function buildRedLineHighways() {
  const laneOffset = 0.44;

  const eastboundMat = new THREE.LineBasicMaterial({
    color: 0x00f2fe, // Glowing Cyan (Eastbound / Northbound)
    linewidth: 3,
    transparent: true,
    opacity: 0.85
  });

  const westboundMat = new THREE.LineBasicMaterial({
    color: 0xf59e0b, // Glowing Amber (Westbound / Southbound)
    linewidth: 3,
    transparent: true,
    opacity: 0.85
  });

  const dividerMat = new THREE.LineDashedMaterial({
    color: 0x64748b, // Center divider
    linewidth: 1,
    dashSize: 0.4,
    gapSize: 0.3,
    transparent: true,
    opacity: 0.45
  });

  const spurMat = new THREE.LineBasicMaterial({
    color: 0x10b981, // Green delivery spurs
    linewidth: 3,
    transparent: true,
    opacity: 0.85
  });

  const aislesZ = [-8.0, -5.0, -1.5, 2.0, 5.5];
  const highwaysX = [-13.0, 13.0];

  // 1. Horizontal Aisles (Dual parallel lanes side-by-side + Center divider)
  aislesZ.forEach(az => {
    // Eastbound Lane (South of center: az + laneOffset)
    const p1East = new THREE.Vector3(-13.0, 0.03, az + laneOffset);
    const p2East = new THREE.Vector3(13.0, 0.03, az + laneOffset);
    const geoEast = new THREE.BufferGeometry().setFromPoints([p1East, p2East]);
    scene.add(new THREE.Line(geoEast, eastboundMat));

    // Westbound Lane (North of center: az - laneOffset)
    const p1West = new THREE.Vector3(-13.0, 0.03, az - laneOffset);
    const p2West = new THREE.Vector3(13.0, 0.03, az - laneOffset);
    const geoWest = new THREE.BufferGeometry().setFromPoints([p1West, p2West]);
    scene.add(new THREE.Line(geoWest, westboundMat));

    // Center divider
    const p1Mid = new THREE.Vector3(-13.0, 0.025, az);
    const p2Mid = new THREE.Vector3(13.0, 0.025, az);
    const geoMid = new THREE.BufferGeometry().setFromPoints([p1Mid, p2Mid]);
    const dividerLine = new THREE.Line(geoMid, dividerMat);
    dividerLine.computeLineDistances();
    scene.add(dividerLine);
  });

  // 2. Vertical Cross-Corridors / Highways (Dual parallel lanes side-by-side + Center divider)
  highwaysX.forEach(hx => {
    // Northbound Lane (West of center: hx - laneOffset)
    const p1North = new THREE.Vector3(hx - laneOffset, 0.03, -8.0);
    const p2North = new THREE.Vector3(hx - laneOffset, 0.03, 5.5);
    const geoNorth = new THREE.BufferGeometry().setFromPoints([p1North, p2North]);
    scene.add(new THREE.Line(geoNorth, eastboundMat));

    // Southbound Lane (East of center: hx + laneOffset)
    const p1South = new THREE.Vector3(hx + laneOffset, 0.03, -8.0);
    const p2South = new THREE.Vector3(hx + laneOffset, 0.03, 5.5);
    const geoSouth = new THREE.BufferGeometry().setFromPoints([p1South, p2South]);
    scene.add(new THREE.Line(geoSouth, westboundMat));

    // Center divider
    const p1Mid = new THREE.Vector3(hx, 0.025, -8.0);
    const p2Mid = new THREE.Vector3(hx, 0.025, 5.5);
    const geoMid = new THREE.BufferGeometry().setFromPoints([p1Mid, p2Mid]);
    const dividerLine = new THREE.Line(geoMid, dividerMat);
    dividerLine.computeLineDistances();
    scene.add(dividerLine);
  });

  // 3. Delivery bay docking spurs from South Aisle Eastbound Lane (5.5 + laneOffset) to Docks
  WarehouseConfig.deliveryBays.forEach(bay => {
    const p1 = new THREE.Vector3(bay.x, 0.03, 5.5 + laneOffset);
    const p2 = new THREE.Vector3(bay.x, 0.03, bay.dockZ || 6.9);
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    scene.add(new THREE.Line(geo, spurMat));
  });

  // 4. Glowing intersection nodes at highway junctions
  const dotGeo = new THREE.CircleGeometry(0.18, 16);
  dotGeo.rotateX(-Math.PI / 2);
  const dotEastMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide });
  const dotWestMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });

  highwaysX.forEach(hx => {
    aislesZ.forEach(az => {
      const dot1 = new THREE.Mesh(dotGeo, dotEastMat);
      dot1.position.set(hx - laneOffset, 0.035, az + laneOffset);
      scene.add(dot1);

      const dot2 = new THREE.Mesh(dotGeo, dotWestMat);
      dot2.position.set(hx + laneOffset, 0.035, az - laneOffset);
      scene.add(dot2);
    });
  });
}

// ----------------------------------------------------
// Structured Pallet Racking & Amazon Boxes
// ----------------------------------------------------
function buildStructuredRacks() {
  const uprightMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Industrial Amazon warehouse upright blue
    metalness: 0.5,
    roughness: 0.35
  });

  const beamMat = new THREE.MeshStandardMaterial({
    color: 0xf97316, // Safety orange load beams
    metalness: 0.4,
    roughness: 0.4
  });

  const deckMat = new THREE.MeshStandardMaterial({
    color: 0xd6cbb8, // Plywood / galvanized wire decking
    roughness: 0.8,
    metalness: 0.1
  });

  // Reusable box materials cache
  const boxTexCache = new Map();

  SimState.racks.forEach(rack => {
    // Register entire rack solid bounding box into static obstacle registry
    staticObstacleBoxes.push({
      name: `Shelf ${rack.id}`,
      box: new THREE.Box3(
        new THREE.Vector3(rack.x - 1.25, 0, rack.z - 0.55),
        new THREE.Vector3(rack.x + 1.25, 3.8, rack.z + 0.55)
      )
    });

    const rackGroup = new THREE.Group();
    rackGroup.position.set(rack.x, 0, rack.z);

    const rw = 2.4;  // rack bay width
    const rd = 1.0;  // rack depth
    const rh = 3.6;  // rack height

    // 4 Corner vertical upright columns
    const colGeo = new THREE.BoxGeometry(0.08, rh, 0.08);
    const colPositions = [
      [-rw / 2, rh / 2, -rd / 2],
      [rw / 2, rh / 2, -rd / 2],
      [-rw / 2, rh / 2, rd / 2],
      [rw / 2, rh / 2, rd / 2]
    ];

    colPositions.forEach(pos => {
      const col = new THREE.Mesh(colGeo, uprightMat);
      col.position.set(...pos);
      col.castShadow = true;
      col.receiveShadow = true;
      rackGroup.add(col);
    });

    // 3 Shelf Tiers
    for (let lvl = 1; lvl <= 3; lvl++) {
      const shelfY = lvl * 1.0;

      // Front & Back Orange Crossbeams
      const beamGeo = new THREE.BoxGeometry(rw, 0.08, 0.06);
      const frontBeam = new THREE.Mesh(beamGeo, beamMat);
      frontBeam.position.set(0, shelfY, rd / 2);
      frontBeam.castShadow = true;
      rackGroup.add(frontBeam);

      const backBeam = new THREE.Mesh(beamGeo, beamMat);
      backBeam.position.set(0, shelfY, -rd / 2);
      backBeam.castShadow = true;
      rackGroup.add(backBeam);

      // Shelf Decking Surface
      const deck = new THREE.Mesh(new THREE.BoxGeometry(rw - 0.05, 0.03, rd - 0.05), deckMat);
      deck.position.set(0, shelfY + 0.02, 0);
      deck.receiveShadow = true;
      rackGroup.add(deck);
    }

    scene.add(rackGroup);
  });

  // Render All Structured Inventory Boxes on Racks
  SimState.boxes.forEach(box => {
    const boxGroup = new THREE.Group();

    let boxMat;
    if (box.isTote) {
      boxMat = new THREE.MeshStandardMaterial({
        map: WarehouseTextures.createToteTexture(box.sku),
        roughness: 0.4,
        metalness: 0.1
      });
    } else {
      if (!boxTexCache.has(box.sku)) {
        boxTexCache.set(box.sku, WarehouseTextures.createBoxTexture(box.sku, box.category));
      }
      boxMat = new THREE.MeshStandardMaterial({
        map: boxTexCache.get(box.sku),
        roughness: 0.7,
        metalness: 0.05
      });
    }

    const bw = box.isTote ? 0.7 : 0.65;
    const bh = box.isTote ? 0.4 : 0.52;
    const bd = box.isTote ? 0.55 : 0.55;

    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), boxMat);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    boxGroup.add(boxMesh);

    boxGroup.position.set(box.homeX, box.homeY + bh / 2, box.homeZ);
    scene.add(boxGroup);

    box.mesh = boxGroup;
    boxMeshes.set(box.id, boxGroup);
  });
}

// ----------------------------------------------------
// Delivery Bays, Conveyor Rollers & Workstation Desks
// ----------------------------------------------------
function buildWorkstationsAndDocks() {
  WarehouseConfig.deliveryBays.forEach((bay, idx) => {
    // Register entire solid conveyor and table footprint as lethal obstacle
    staticObstacleBoxes.push({
      name: `${bay.name || ('Dock ' + (idx + 1))}`,
      box: new THREE.Box3(
        new THREE.Vector3(bay.x - 1.15, 0, bay.z - 0.65),
        new THREE.Vector3(bay.x + 1.15, 2.2, bay.z + 0.65)
      )
    });

    const dockGroup = new THREE.Group();
    dockGroup.position.set(bay.x, 0, bay.z);

    // Conveyor table base
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.2), tableMat);
    tableTop.position.set(0, 0.8, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    dockGroup.add(tableTop);

    // Conveyor Steel Rollers
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    for (let rx = -0.9; rx <= 0.9; rx += 0.2) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), rollerMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(rx, 0.88, 0);
      dockGroup.add(roller);
    }

    // Table legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.8, 0.08);
    [[-0.95, -0.45], [0.95, -0.45], [-0.95, 0.45], [0.95, 0.45]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, tableMat);
      leg.position.set(lx, 0.4, lz);
      leg.castShadow = true;
      dockGroup.add(leg);
    });

    // Workstation Operator Terminal (Monitor + Stand)
    const monitorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.35, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 })
    );
    monitorFrame.position.set(0.6, 1.15, -0.3);
    monitorFrame.rotation.y = -0.2;
    dockGroup.add(monitorFrame);

    const monitorScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe })
    );
    monitorScreen.position.set(0.6, 1.15, -0.278);
    monitorScreen.rotation.y = -0.2;
    dockGroup.add(monitorScreen);

    // Overhead Dock Sign
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 0.6),
      new THREE.MeshBasicMaterial({
        map: WarehouseTextures.createSignTexture(`DOCK ${idx + 1}`),
        transparent: true
      })
    );
    signMesh.position.set(0, 3.2, 0);
    dockGroup.add(signMesh);

    scene.add(dockGroup);
  });

  // Charging Pads on floor
  WarehouseConfig.chargingPads.forEach(pad => {
    const padMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.02, 1.6),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.5,
        metalness: 0.6
      })
    );
    padMesh.position.set(pad.x, 0.01, pad.z);

    // Glowing green charging perimeter indicator
    const border = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 0.72, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
    );
    border.rotation.x = -Math.PI / 2;
    border.position.set(pad.x, 0.02, pad.z);
    scene.add(border);
    scene.add(padMesh);
  });
}

// ----------------------------------------------------
// Autonomous Mobile Robot (AMR) 3D Models
// ----------------------------------------------------
function buildAMRFleet() {
  SimState.robots.forEach(robot => {
    const robotGroup = createAMRMesh(robot);
    robotGroup.position.set(robot.x, 0, robot.z);
    robotGroup.rotation.y = robot.rotation;
    scene.add(robotGroup);
    robotMeshes.set(robot.id, robotGroup);

    // Holographic Laser Guide Line
    const laserMat = new THREE.LineBasicMaterial({
      color: robot.color,
      linewidth: 3,
      transparent: true,
      opacity: 0.85
    });
    const laserGeo = new THREE.BufferGeometry();
    const laserLine = new THREE.Line(laserGeo, laserMat);
    scene.add(laserLine);
    laserGuideLines.set(robot.id, laserLine);
  });
}

function createAMRMesh(robot) {
  const group = new THREE.Group();
  group.userData = { robotId: robot.id };

  const isHeavy = robot.type === 'heavy_arm';

  // 1. Lower Drive Chassis (Beveled Rounded Body)
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.35,
    roughness: 0.25
  });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 1.2), chassisMat);
  chassis.position.y = 0.16;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);
  group.userData.chassis = chassis;

  // 2. Drive Wheels / Rubber Treads on sides
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8, metalness: 0.1 });
  const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  [[-0.47, 0.12, -0.35], [-0.47, 0.12, 0.35], [0.47, 0.12, -0.35], [0.47, 0.12, 0.35]].forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(...pos);
    wheel.castShadow = true;
    group.add(wheel);
  });

  // 3. Glowing LED Status Perimeter Ring
  const ringMat = new THREE.MeshBasicMaterial({
    color: robot.color,
    transparent: true,
    opacity: 0.95
  });
  const ledRing = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.04, 1.24), ringMat);
  ledRing.position.y = 0.22;
  group.add(ledRing);
  group.userData.ledRing = ledRing;

  // 4. Rotating 360° Safety LiDAR Turret
  const lidarBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
  );
  lidarBase.position.set(0, 0.32, 0.45);
  group.add(lidarBase);

  const lidarRotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12),
    new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00f2fe, emissiveIntensity: 0.5 })
  );
  lidarRotor.position.set(0, 0.38, 0.45);
  group.add(lidarRotor);
  group.userData.lidarRotor = lidarRotor;

  // 5. Central Motorized Jack Lift Platform (Holds Amazon boxes)
  const liftMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
  const liftPlate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.8), liftMat);
  liftPlate.position.set(0, 0.29, -0.05);
  liftPlate.castShadow = true;
  group.add(liftPlate);
  group.userData.liftPlate = liftPlate;

  // 6. For ATR-600: Articulated Robotic Gripper Arm
  if (isHeavy) {
    const armBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    armBase.position.set(0, 0.35, -0.2);
    group.add(armBase);

    const armLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5 })
    );
    armLower.position.set(0, 0.58, -0.15);
    armLower.rotation.x = 0.35;
    group.add(armLower);

    const armUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    armUpper.position.set(0, 0.88, 0.05);
    armUpper.rotation.x = -0.55;
    group.add(armUpper);
  }

  return group;
}

// ----------------------------------------------------
// Real-time 3D Dynamic Floating HUD Overlays
// ----------------------------------------------------
function updateFloatingHUDs() {
  const container = document.getElementById('hud-overlay-container');
  if (!SimState.showHuds) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';

  // Clean up any stale HUD cards whose robot is no longer active
  const activeRobotIds = new Set(SimState.robots.map(r => r.id));
  Array.from(container.children).forEach(child => {
    const id = child.id.replace('hud-card-', '');
    if (!activeRobotIds.has(id)) {
      child.remove();
    }
  });

  SimState.robots.forEach(robot => {
    let hudCard = document.getElementById(`hud-card-${robot.id}`);

    if (!hudCard) {
      hudCard = document.createElement('div');
      hudCard.id = `hud-card-${robot.id}`;
      hudCard.className = 'robot-hud-card';
      hudCard.onclick = () => selectRobot(robot.id);
      container.appendChild(hudCard);
    }

    // World position of robot center + height offset
    const worldPos = new THREE.Vector3(robot.x, 0.95, robot.z);

    // Direction check to ensure robot is in front of camera
    const toRobot = new THREE.Vector3().subVectors(worldPos, camera.position);
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    if (camDir.dot(toRobot) <= 0) {
      hudCard.style.display = 'none';
      return;
    }

    // Screen projection
    worldPos.project(camera);

    // Check NDC bounds
    if (worldPos.z > 1.0 || Math.abs(worldPos.x) > 1.2 || Math.abs(worldPos.y) > 1.2) {
      hudCard.style.display = 'none';
      return;
    }

    const screenX = (worldPos.x * 0.5 + 0.5) * container.clientWidth;
    const screenY = (-worldPos.y * 0.5 + 0.5) * container.clientHeight;

    hudCard.style.display = 'block';
    hudCard.style.left = `${screenX}px`;
    hudCard.style.top = `${screenY}px`;

    if (robot.id === SimState.selectedRobotId) {
      hudCard.classList.add('selected');
    } else {
      hudCard.classList.remove('selected');
    }

    // Status styling class
    const statusClass = `status-${robot.status.toLowerCase().replace(/_/g, '-')}`;

    // Task text
    let taskDesc = 'Idle / Patrol';
    if (robot.status === 'EN_ROUTE_PICKUP') taskDesc = 'En Route to Pickup';
    else if (robot.status === 'PICKING') taskDesc = 'Lifting Package';
    else if (robot.status === 'EN_ROUTE_DELIVERY') taskDesc = `Delivering ${robot.carriedBox ? robot.carriedBox.sku : ''}`;
    else if (robot.status === 'DELIVERING') taskDesc = 'Unloading to Bay';
    else if (robot.status === 'CHARGING') taskDesc = 'Charging at Pad';

    // Battery color
    const batColor = robot.battery > 50 ? '#10b981' : (robot.battery > 20 ? '#f59e0b' : '#ef4444');

    hudCard.innerHTML = `
      <div class="hud-header">
        <span class="hud-robot-name">${robot.name}</span>
        <span class="hud-robot-badge">${robot.model}</span>
      </div>
      <div class="hud-body">
        <div class="hud-row">
          <span class="hud-label">Status:</span>
          <span class="hud-val ${statusClass}">${robot.status.replace(/_/g, ' ')}</span>
        </div>
        <div class="hud-row">
          <span class="hud-label">Task:</span>
          <span class="hud-val" style="max-width: 95px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${taskDesc}</span>
        </div>
        <div class="hud-row">
          <span class="hud-label">Speed:</span>
          <span class="hud-val speed-val">${robot.speed.toFixed(1)} m/s</span>
        </div>
        ${robot.lidar_min !== undefined ? `
        <div class="hud-row">
          <span class="hud-label">2D LiDAR:</span>
          <span class="hud-val" style="color: ${robot.lidar_min < 0.6 ? '#ef4444' : '#38bdf8'}; font-size: 9px;">${robot.lidar_min.toFixed(2)}m - ${robot.lidar_max.toFixed(1)}m</span>
        </div>` : ''}
        <div class="hud-row">
          <span class="hud-label">Battery:</span>
          <span class="hud-val" style="color: ${batColor};">${Math.round(robot.battery)}%</span>
        </div>
        <div class="hud-battery-bar">
          <div class="hud-battery-fill" style="width: ${robot.battery}%; background: ${batColor};"></div>
        </div>
      </div>
    `;
  });
}

// ----------------------------------------------------
// Laser Guides Floor Waypoint Lines
// ----------------------------------------------------
function updateLaserGuides() {
  SimState.robots.forEach(robot => {
    const laserLine = laserGuideLines.get(robot.id);
    if (!laserLine) return;

    if (!SimState.showLaserGuides || robot.waypoints.length === 0 || robot.waypointIndex >= robot.waypoints.length) {
      laserLine.visible = false;
      return;
    }

    laserLine.visible = true;
    const points = [new THREE.Vector3(robot.x, 0.04, robot.z)];

    for (let i = robot.waypointIndex; i < robot.waypoints.length; i++) {
      points.push(new THREE.Vector3(robot.waypoints[i].x, 0.04, robot.waypoints[i].z));
    }

    laserLine.geometry.setFromPoints(points);
  });
}

// ----------------------------------------------------
// UI Lists & Sidebar Telemetry Updates
// ----------------------------------------------------
function updateUILists() {
  // Update Metrics
  document.getElementById('metric-completed').textContent = SimState.metrics.tasksCompleted;
  document.getElementById('metric-collisions').textContent = SimState.metrics.collisions;
  document.getElementById('metric-deadlocks').textContent = SimState.metrics.deadlocks;
  document.getElementById('metric-avg-time').textContent = `${SimState.metrics.avgTaskTime}s`;
  document.getElementById('active-amr-counter').textContent = `ACTIVE AMRs: ${SimState.robots.length}`;
  document.getElementById('sidebar-amr-online-count').textContent = `${SimState.robots.length} ONLINE`;

  // Update Robot List
  const robotListEl = document.getElementById('robot-card-list');
  robotListEl.innerHTML = '';

  SimState.robots.forEach(robot => {
    const card = document.createElement('div');
    card.className = `robot-item-card ${robot.id === SimState.selectedRobotId ? 'active' : ''}`;
    card.onclick = () => selectRobot(robot.id);

    const statusBadgeClass = `status-badge-${robot.status.toLowerCase().replace(/_/g, '-')}`;
    const batColor = robot.battery > 50 ? '#10b981' : (robot.battery > 20 ? '#f59e0b' : '#ef4444');

    card.innerHTML = `
      <div class="robot-item-top">
        <div class="robot-item-id">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${robot.type==='heavy_arm'?'#f59e0b':'#00f2fe'};"></span>
          ${robot.model} &middot; ${robot.id}
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div class="robot-status-pill ${statusBadgeClass}">${robot.status.replace(/_/g, ' ')}</div>
          <button class="robot-card-delete-btn" title="Remove ${robot.name}" onclick="event.stopPropagation(); window.removeRobot('${robot.id}')">&times;</button>
        </div>
      </div>
      <div class="robot-battery-row">
        <span style="font-size:10px; font-family:var(--font-mono); color:var(--text-dim);">Battery Health</span>
        <div class="robot-battery-track">
          <div class="robot-battery-bar-fill" style="width:${robot.battery}%; background:${batColor};"></div>
        </div>
        <span style="font-size:10px; font-family:var(--font-mono); color:${batColor}; font-weight:700;">${Math.round(robot.battery)}%</span>
      </div>
      <div class="robot-item-details">
        <span>Speed: <strong>${robot.speed.toFixed(1)} m/s</strong></span>
        <span>Payload: <strong>${robot.payload.toFixed(1)} kg</strong></span>
        <span>Stage: <strong>${robot.status}</strong></span>
        <span>Pos: <strong>(${robot.x.toFixed(0)}, ${robot.z.toFixed(0)})</strong></span>
      </div>
    `;
    robotListEl.appendChild(card);
  });

  // Update Task Missions Queue
  const taskListEl = document.getElementById('task-mission-list');
  const activeTasks = SimState.taskQueue.filter(t => t.status !== 'COMPLETED');
  document.getElementById('sidebar-task-queue-count').textContent = `${activeTasks.length} QUEUED`;

  taskListEl.innerHTML = '';
  activeTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-item-card';

    const pClass = `priority-${task.priority.toLowerCase()}`;
    const assignedRobot = SimState.robots.find(r => r.id === task.assignedRobotId);

    card.innerHTML = `
      <div class="task-item-header">
        <div class="task-sku-title">${task.sku}</div>
        <div class="task-priority-badge ${pClass}">${task.priority}</div>
      </div>
      <div class="task-route-desc">
        Pickup: (${task.sourceRack.aisle}, ${task.sourceRack.bay}) &rarr; Drop: ${task.targetBay.name}
      </div>
      <div class="task-assigned-robot">
        ${assignedRobot ? `Assigned to ${assignedRobot.name} (${assignedRobot.status})` : '<span style="color:var(--text-dim);">Awaiting Idle AMR Dispatch</span>'}
      </div>
    `;
    taskListEl.appendChild(card);
  });
}

// ----------------------------------------------------
// Selection & Camera Modes
// ----------------------------------------------------
function selectRobot(robotId) {
  SimState.selectedRobotId = robotId;
  updateUILists();

  const robot = SimState.robots.find(r => r.id === robotId);
  if (!robot) return;

  // Open inspector modal
  const modal = document.getElementById('modal-robot-inspector');
  document.getElementById('inspector-robot-title').textContent = `${robot.name} Telemetry`;
  document.getElementById('insp-status').textContent = robot.status.replace(/_/g, ' ');
  document.getElementById('insp-speed').textContent = `${robot.speed.toFixed(1)} m/s (Real)`;
  document.getElementById('insp-battery').textContent = `${Math.round(robot.battery)}%`;
  document.getElementById('insp-payload').textContent = `${robot.payload.toFixed(1)} kg`;
  document.getElementById('insp-odometer').textContent = `${robot.odometer.toFixed(1)} m`;
  document.getElementById('insp-coords').textContent = `(${robot.x.toFixed(1)}, ${robot.z.toFixed(1)})`;

  let taskDesc = 'Standby in transit corridor';
  if (robot.currentTask) {
    taskDesc = `Task ${robot.currentTask.id}: Carrying ${robot.currentTask.sku} to ${robot.currentTask.targetBay.name} (Priority ${robot.currentTask.priority})`;
  }
  document.getElementById('insp-task-desc').textContent = taskDesc;

  modal.classList.add('active');
}

function updateInspectorModalLive() {
  const modal = document.getElementById('modal-robot-inspector');
  if (!modal || !modal.classList.contains('active')) return;
  if (!SimState.selectedRobotId) return;

  const robot = SimState.robots.find(r => r.id === SimState.selectedRobotId);
  if (!robot) {
    modal.classList.remove('active');
    return;
  }

  const titleEl = document.getElementById('inspector-robot-title');
  if (titleEl) titleEl.textContent = `${robot.name} Telemetry`;
  const statusEl = document.getElementById('insp-status');
  if (statusEl) statusEl.textContent = robot.status.replace(/_/g, ' ');
  const speedEl = document.getElementById('insp-speed');
  if (speedEl) speedEl.textContent = `${robot.speed.toFixed(1)} m/s (Real)`;
  const batEl = document.getElementById('insp-battery');
  if (batEl) batEl.textContent = `${Math.round(robot.battery)}%`;
  const payEl = document.getElementById('insp-payload');
  if (payEl) payEl.textContent = `${robot.payload.toFixed(1)} kg`;
  const odoEl = document.getElementById('insp-odometer');
  if (odoEl) odoEl.textContent = `${robot.odometer.toFixed(1)} m`;
  const coordsEl = document.getElementById('insp-coords');
  if (coordsEl) coordsEl.textContent = `(${robot.x.toFixed(1)}, ${robot.z.toFixed(1)})`;

  let taskDesc = 'Standby in transit corridor';
  if (robot.currentTask) {
    taskDesc = `Task ${robot.currentTask.id}: Carrying ${robot.currentTask.sku} to ${robot.currentTask.targetBay?.name || 'Bay'} (Priority ${robot.currentTask.priority})`;
  }
  const descEl = document.getElementById('insp-task-desc');
  if (descEl) descEl.textContent = taskDesc;
}

function setCameraMode(mode) {
  SimState.cameraMode = mode;
  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cam === mode);
  });

  if (mode === 'overview') {
    smoothMoveCamera(CAM_PRESETS.overview.pos, CAM_PRESETS.overview.target);
  } else if (mode === 'topdown') {
    smoothMoveCamera(CAM_PRESETS.topdown.pos, CAM_PRESETS.topdown.target);
  } else if (mode === 'workstation') {
    smoothMoveCamera(CAM_PRESETS.workstation.pos, CAM_PRESETS.workstation.target);
  }
}

function smoothMoveCamera(targetPos, targetLookAt) {
  controls.target.copy(targetLookAt);
  camera.position.copy(targetPos);
}

// Raycast AMR Selection on Click
function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const meshes = Array.from(robotMeshes.values());
  const intersects = raycaster.intersectObjects(meshes, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.userData.robotId) {
      obj = obj.parent;
    }
    if (obj && obj.userData.robotId) {
      selectRobot(obj.userData.robotId);
    }
  }
}

// ----------------------------------------------------
// Event Listeners & UI Binding
// ----------------------------------------------------
function setupEventListeners() {
  // Speed multiplier buttons
  document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn[data-speed]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SimState.timeScale = parseFloat(btn.dataset.speed);
    });
  });

  // Pause / Resume
  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      SimState.isPaused = !SimState.isPaused;
      pauseBtn.textContent = SimState.isPaused ? '▶' : '⏸';
      pauseBtn.classList.toggle('active', SimState.isPaused);
    });
  }

  // Dataset Run Dropdown (autonomous_navigation_dataset.csv)
  const datasetSelect = document.getElementById('select-dataset-run');
  if (datasetSelect) {
    datasetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'live') {
        WarehouseSim.restoreLiveSim();
      } else {
        WarehouseSim.loadDatasetRun(val);
      }
    });
  }

  // Camera presets
  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', () => setCameraMode(btn.dataset.cam));
  });

  // Checkboxes
  const chkHuds = document.getElementById('chk-3d-huds');
  if (chkHuds) {
    chkHuds.addEventListener('change', (e) => {
      SimState.showHuds = e.target.checked;
    });
  }
  const chkLaser = document.getElementById('chk-laser-guides');
  if (chkLaser) {
    chkLaser.addEventListener('change', (e) => {
      SimState.showLaserGuides = e.target.checked;
    });
  }

  // Helper to synchronize all robot selectors in modals
  function updateRobotSelectDropdowns() {
    const selTask = document.getElementById('select-task-assigned-robot');
    if (selTask) {
      const currentVal = selTask.value;
      selTask.innerHTML = '<option value="auto">Auto-Assign (Auction Manager)</option>';
      SimState.robots.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.name} (${r.model})`;
        selTask.appendChild(opt);
      });
      if (SimState.robots.some(r => r.id === currentVal)) {
        selTask.value = currentVal;
      }
    }

    const selRemove = document.getElementById('select-remove-robot');
    if (selRemove) {
      selRemove.innerHTML = '';
      SimState.robots.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.name} (${r.model}) - ${r.status}`;
        selRemove.appendChild(opt);
      });
    }

    const selTeleop = document.getElementById('select-teleop-robot');
    if (selTeleop) {
      const currentVal = selTeleop.value;
      selTeleop.innerHTML = '';
      SimState.robots.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id.replace('-', '_');
        opt.textContent = `${r.name} (${r.model})`;
        selTeleop.appendChild(opt);
      });
      if (currentVal) selTeleop.value = currentVal;
    }
  }

  // Decommission and remove AMR unit
  function removeRobot(robotId) {
    if (!robotId) return;
    const index = SimState.robots.findIndex(r => r.id === robotId);
    if (index === -1) return;
    const robot = SimState.robots[index];

    // 1. Remove 3D Mesh
    if (robotMeshes.has(robotId)) {
      const mesh = robotMeshes.get(robotId);
      scene.remove(mesh);
      mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      robotMeshes.delete(robotId);
    }

    // 2. Remove Laser Line
    if (laserGuideLines.has(robotId)) {
      const line = laserGuideLines.get(robotId);
      scene.remove(line);
      if (line.geometry) line.geometry.dispose();
      if (line.material) line.material.dispose();
      laserGuideLines.delete(robotId);
    }

    // 3. Remove 3D Floating HUD element from DOM
    const hudCard = document.getElementById(`hud-card-${robotId}`);
    if (hudCard) {
      hudCard.remove();
    }

    // 4. Reset any carried box back to storage rack inventory
    if (robot.carriedBox) {
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

    // 5. Cancel active task and unassign all tasks in queue for this robot
    if (robot.currentTask) {
      robot.currentTask.status = 'QUEUED';
      robot.currentTask.assignedRobotId = null;
    }
    SimState.taskQueue.forEach(t => {
      if (t.assignedRobotId === robotId) {
        t.assignedRobotId = null;
        if (t.status === 'IN_PROGRESS') {
          t.status = 'QUEUED';
        }
      }
    });

    // 6. Remove robot from active state
    SimState.robots.splice(index, 1);

    // 7. Update selectedRobotId
    if (SimState.selectedRobotId === robotId) {
      SimState.selectedRobotId = SimState.robots.length > 0 ? SimState.robots[0].id : null;
      const inspModal = document.getElementById('modal-robot-inspector');
      if (inspModal) inspModal.classList.remove('active');
    }

    // 8. Update active teleop robot if decommissioned
    const rosId = robotId.replace('-', '_');
    if (typeof activeTeleopRobotId !== 'undefined' && activeTeleopRobotId === rosId) {
      activeTeleopRobotId = SimState.robots.length > 0 ? SimState.robots[0].id.replace('-', '_') : null;
    }

    // 9. Update header counter immediately
    const counterEl = document.getElementById('active-amr-counter');
    if (counterEl) {
      counterEl.textContent = `ACTIVE AMRs: ${SimState.robots.length}`;
    }

    // 10. Log to Fleet Comms
    if (window.logFleetComms) {
      window.logFleetComms(robot.name || robotId, `DECOMMISSIONED: AMR unit removed from active warehouse fleet`, 'DENY');
    }

    updateUILists();
    updateRobotSelectDropdowns();

    // 11. Try dispatching remaining queued tasks to remaining idle AMRs
    if (typeof WarehouseSim !== 'undefined' && WarehouseSim.dispatchNextTask) {
      WarehouseSim.dispatchNextTask();
    }
  }
  window.removeRobot = removeRobot;

  // Initialize dropdowns
  updateRobotSelectDropdowns();

  // Modal open buttons
  const btnAddRobot = document.getElementById('btn-add-robot');
  if (btnAddRobot) {
    btnAddRobot.addEventListener('click', () => {
      const m = document.getElementById('modal-add-robot');
      if (m) m.classList.add('active');
    });
  }

  const btnRemoveRobot = document.getElementById('btn-remove-robot');
  if (btnRemoveRobot) {
    btnRemoveRobot.addEventListener('click', () => {
      updateRobotSelectDropdowns();
      const sel = document.getElementById('select-remove-robot');
      if (sel && SimState.selectedRobotId) {
        sel.value = SimState.selectedRobotId;
      }
      const m = document.getElementById('modal-remove-robot');
      if (m) m.classList.add('active');
    });
  }

  const btnCreateTask = document.getElementById('btn-create-task');
  if (btnCreateTask) {
    btnCreateTask.addEventListener('click', () => {
      updateRobotSelectDropdowns();
      // Populate select with available boxes
      const sel = document.getElementById('select-task-sku');
      if (sel) {
        sel.innerHTML = '';
        let availableBoxes = SimState.boxes.filter(b => !b.inTransit);
        if (availableBoxes.length === 0) availableBoxes = SimState.boxes;
        availableBoxes.slice(0, 20).forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.sku;
          opt.textContent = `${b.sku} (${b.category} - ${b.weight}kg, Aisle ${b.aisle})`;
          sel.appendChild(opt);
        });
      }
      const m = document.getElementById('modal-create-task');
      if (m) m.classList.add('active');
    });
  }

  const btnFullComms = document.getElementById('btn-fullscreen-comms');
  if (btnFullComms) {
    btnFullComms.addEventListener('click', () => {
      const m = document.getElementById('modal-fullscreen-comms');
      if (m) m.classList.add('active');
    });
  }

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      const m = document.getElementById(modalId);
      if (m) m.classList.remove('active');
    });
  });

  // Confirm Add Robot
  const btnConfirmAdd = document.getElementById('btn-confirm-add-robot');
  if (btnConfirmAdd) {
    btnConfirmAdd.addEventListener('click', () => {
      const model = document.getElementById('select-robot-model')?.value || 'ATR-400';
      const newRobot = WarehouseSim.spawnNewRobot(model);

      // Create 3D Mesh
      const newMesh = createAMRMesh(newRobot);
      newMesh.position.set(newRobot.x, 0, newRobot.z);
      scene.add(newMesh);
      robotMeshes.set(newRobot.id, newMesh);

      // Laser Line
      const laserMat = new THREE.LineBasicMaterial({
        color: newRobot.color,
        linewidth: 3,
        transparent: true,
        opacity: 0.85
      });
      const laserLine = new THREE.Line(new THREE.BufferGeometry(), laserMat);
      scene.add(laserLine);
      laserGuideLines.set(newRobot.id, laserLine);

      const m = document.getElementById('modal-add-robot');
      if (m) m.classList.remove('active');
      updateUILists();
      updateRobotSelectDropdowns();
    });
  }

  // Confirm Remove Robot
  const btnConfirmRemove = document.getElementById('btn-confirm-remove-robot');
  if (btnConfirmRemove) {
    btnConfirmRemove.addEventListener('click', () => {
      const targetId = document.getElementById('select-remove-robot')?.value;
      if (targetId) {
        removeRobot(targetId);
      }
      const m = document.getElementById('modal-remove-robot');
      if (m) m.classList.remove('active');
    });
  }

  // Remove Robot from inspector modal
  const btnInspRemove = document.getElementById('btn-insp-remove');
  if (btnInspRemove) {
    btnInspRemove.addEventListener('click', () => {
      const targetId = SimState.selectedRobotId;
      if (targetId) {
        removeRobot(targetId);
      }
      const m = document.getElementById('modal-robot-inspector');
      if (m) m.classList.remove('active');
    });
  }

  // Confirm Create Task
  const btnConfirmTask = document.getElementById('btn-confirm-create-task');
  if (btnConfirmTask) {
    btnConfirmTask.addEventListener('click', () => {
      const sku = document.getElementById('select-task-sku')?.value;
      const bayId = document.getElementById('select-task-bay')?.value;
      const priority = document.getElementById('select-task-priority')?.value || 'P1';
      const assignedRobot = document.getElementById('select-task-assigned-robot')?.value || 'auto';

      if (sku && bayId) {
        const newTask = WarehouseSim.createManualTask(sku, bayId, priority, assignedRobot);
        if (window.logFleetComms && newTask) {
          window.logFleetComms('OPERATOR', `Created Task ${newTask.id}: ${sku} -> Bay ${bayId} (Priority: ${priority}, Target: ${assignedRobot})`, 'GRANT');
        }
      }
      const m = document.getElementById('modal-create-task');
      if (m) m.classList.remove('active');
      updateUILists();
      updateInspectorModalLive();
    });
  }

  // Follow with camera from inspector
  const btnInspFollow = document.getElementById('btn-insp-follow');
  if (btnInspFollow) {
    btnInspFollow.addEventListener('click', () => {
      const m = document.getElementById('modal-robot-inspector');
      if (m) m.classList.remove('active');
      setCameraMode('follow');
    });
  }

  // Drive (Teleop) from inspector
  const btnInspDrive = document.getElementById('btn-insp-drive');
  if (btnInspDrive) {
    btnInspDrive.addEventListener('click', () => {
      const inspModal = document.getElementById('modal-robot-inspector');
      if (inspModal) inspModal.classList.remove('active');

      const targetId = (SimState.selectedRobotId || 'robot-1').replace('-', '_');
      activeTeleopRobotId = targetId;

      const selTeleop = document.getElementById('select-teleop-robot');
      if (selTeleop) selTeleop.value = targetId;

      const teleopModal = document.getElementById('modal-manual-teleop');
      if (teleopModal) teleopModal.classList.add('active');

      updateTeleopStatus();
    });
  }

  // Assign Task directly to inspected robot
  const btnInspAssign = document.getElementById('btn-insp-assign');
  if (btnInspAssign) {
    btnInspAssign.addEventListener('click', () => {
      const robotId = SimState.selectedRobotId || (SimState.robots[0] ? SimState.robots[0].id : null);
      if (!robotId) return;
      const robot = SimState.robots.find(r => r.id === robotId);
      if (!robot) return;

      // Find available warehouse boxes not in transit
      let availableBoxes = SimState.boxes.filter(b => !b.inTransit);
      if (availableBoxes.length === 0) {
        SimState.boxes.forEach(b => b.inTransit = false);
        availableBoxes = SimState.boxes;
      }
      if (availableBoxes.length === 0) return;

      const randomBox = availableBoxes[Math.floor(Math.random() * Math.min(12, availableBoxes.length))];
      const randomBay = WarehouseConfig.deliveryBays[Math.floor(Math.random() * WarehouseConfig.deliveryBays.length)];

      const newTask = WarehouseSim.createManualTask(randomBox.sku, randomBay.id, 'P1', robot.id);

      // Instant UI update in inspector modal
      const statusEl = document.getElementById('insp-status');
      if (statusEl) statusEl.textContent = 'EN ROUTE PICKUP';
      const descEl = document.getElementById('insp-task-desc');
      if (descEl && newTask) {
        descEl.textContent = `Task ${newTask.id}: Carrying ${newTask.sku} to ${newTask.targetBay?.name || 'Delivery Bay'} (Priority ${newTask.priority})`;
      }

      // Immediate visual feedback on the button
      const originalText = btnInspAssign.textContent;
      btnInspAssign.textContent = '✅ Task Dispatched!';
      btnInspAssign.style.background = 'rgba(16, 185, 129, 0.25)';
      btnInspAssign.style.borderColor = '#10b981';
      btnInspAssign.style.color = '#10b981';

      setTimeout(() => {
        btnInspAssign.textContent = originalText;
        btnInspAssign.style.background = 'rgba(245, 158, 11, 0.2)';
        btnInspAssign.style.borderColor = 'var(--accent-orange)';
        btnInspAssign.style.color = 'var(--accent-orange)';
      }, 1600);

      updateUILists();
      updateInspectorModalLive();
    });
  }

  // Setup teleoperation controls
  setupTeleopControls();
}

// ----------------------------------------------------
// Teleoperation & Manual Driving Controller
// ----------------------------------------------------
let teleopSpeed = 0.4;
let activeTeleopRobotId = 'robot_1';

function setupTeleopControls() {
  const selRobot = document.getElementById('select-teleop-robot');
  if (selRobot) {
    selRobot.addEventListener('change', (e) => {
      activeTeleopRobotId = e.target.value;
      updateTeleopStatus();
    });
  }

  document.querySelectorAll('.teleop-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.teleop-speed-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'var(--border-color)';
        b.style.color = 'var(--text-dim)';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(0, 242, 254, 0.2)';
      btn.style.borderColor = 'var(--accent-cyan)';
      btn.style.color = '#ffffff';
      teleopSpeed = parseFloat(btn.dataset.speed) || 0.4;
    });
  });

  const driveRobot = (linear, angular) => {
    const simId = activeTeleopRobotId.replace('_', '-');
    const robot = SimState.robots.find(r => r.id === simId || r.id === activeTeleopRobotId);
    if (!robot) return;

    robot.isRosControlled = true;
    robot.status = 'MANUAL_TELEOP';

    robot.rotation += angular;
    robot.x += Math.sin(robot.rotation) * linear;
    robot.z += Math.cos(robot.rotation) * linear;
    robot.speed = Math.abs(linear) * 2;

    updateTeleopStatus();
    if (window.ROSBridge && window.ROSBridge.publishCmdVel) {
      window.ROSBridge.publishCmdVel(activeTeleopRobotId, linear * 2, angular * 2);
    }
  };

  const resumeAutoBtn = document.getElementById('btn-teleop-resume-auto');
  if (resumeAutoBtn) {
    resumeAutoBtn.addEventListener('click', () => {
      const simId = activeTeleopRobotId.replace('_', '-');
      const robot = SimState.robots.find(r => r.id === simId || r.id === activeTeleopRobotId);
      if (robot) {
        robot.isRosControlled = false;
        robot.status = 'IDLE';
        robot.speed = 0;
      }
      updateTeleopStatus();
    });
  }

  const btnFwd = document.getElementById('btn-teleop-forward');
  if (btnFwd) btnFwd.addEventListener('click', () => driveRobot(teleopSpeed * 0.5, 0));

  const btnRev = document.getElementById('btn-teleop-reverse');
  if (btnRev) btnRev.addEventListener('click', () => driveRobot(-teleopSpeed * 0.5, 0));

  const btnLeft = document.getElementById('btn-teleop-left');
  if (btnLeft) btnLeft.addEventListener('click', () => driveRobot(0, 0.25));

  const btnRight = document.getElementById('btn-teleop-right');
  if (btnRight) btnRight.addEventListener('click', () => driveRobot(0, -0.25));

  const btnStop = document.getElementById('btn-teleop-stop');
  if (btnStop) {
    btnStop.addEventListener('click', () => {
      const simId = activeTeleopRobotId.replace('_', '-');
      const robot = SimState.robots.find(r => r.id === simId || r.id === activeTeleopRobotId);
      if (robot) robot.speed = 0;
      if (window.ROSBridge && window.ROSBridge.publishCmdVel) {
        window.ROSBridge.publishCmdVel(activeTeleopRobotId, 0, 0);
      }
      updateTeleopStatus();
    });
  }

  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('modal-manual-teleop');
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'w' || e.key === 'ArrowUp') {
      driveRobot(teleopSpeed * 0.4, 0);
      e.preventDefault();
    } else if (e.key === 's' || e.key === 'ArrowDown') {
      driveRobot(-teleopSpeed * 0.4, 0);
      e.preventDefault();
    } else if (e.key === 'a' || e.key === 'ArrowLeft') {
      driveRobot(0, 0.2);
      e.preventDefault();
    } else if (e.key === 'd' || e.key === 'ArrowRight') {
      driveRobot(0, -0.2);
      e.preventDefault();
    } else if (e.key === ' ') {
      btnStop && btnStop.click();
      e.preventDefault();
    }
  });
}

function updateTeleopStatus() {
  const simId = activeTeleopRobotId.replace('_', '-');
  const robot = SimState.robots.find(r => r.id === simId || r.id === activeTeleopRobotId);
  if (!robot) return;

  const modeBadge = document.getElementById('teleop-mode-badge');
  if (modeBadge) {
    if (robot.status === 'MANUAL_TELEOP') {
      modeBadge.textContent = '🕹️ MANUAL OVERRIDE (TELEOP)';
      modeBadge.style.color = 'var(--accent-orange)';
    } else {
      modeBadge.textContent = '🟢 AUTONOMOUS (HIGHWAY)';
      modeBadge.style.color = '#10b981';
    }
  }

  const coords = document.getElementById('teleop-coords');
  if (coords) coords.textContent = `(${robot.x.toFixed(2)}m, ${robot.z.toFixed(2)}m)`;

  const speedYaw = document.getElementById('teleop-speed-yaw');
  if (speedYaw) speedYaw.textContent = `${robot.rotation.toFixed(2)} rad · ${robot.speed.toFixed(1)} m/s`;
}

function onWindowResize() {
  const container = document.getElementById('viewport-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// ----------------------------------------------------
// Main Render & Simulation Loop
// ----------------------------------------------------
let lastUIUpdate = 0;

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // 1. Advance Simulation Physics & Robot Kinematics
  WarehouseSim.update(delta);

  // 2. Synchronize 3D Meshes with AMR Physics State
  SimState.robots.forEach(robot => {
    const mesh = robotMeshes.get(robot.id);
    if (mesh) {
      mesh.position.set(robot.x, 0, robot.z);
      mesh.rotation.y = robot.rotation;

      // Spin safety LiDAR scanner head
      if (mesh.userData.lidarRotor) {
        mesh.userData.lidarRotor.rotation.y += delta * 12;
      }

      // Elevate/Lower Motorized Jack Lift Platform
      if (mesh.userData.liftPlate) {
        mesh.userData.liftPlate.position.y = 0.29 + robot.liftProgress * 0.15;
      }

      // Carried Box positioning on top of robot platform
      if (robot.carriedBox && robot.carriedBox.mesh) {
        robot.carriedBox.mesh.position.set(
          robot.x,
          0.38 + robot.liftProgress * 0.15,
          robot.z - 0.05
        );
        robot.carriedBox.mesh.rotation.y = robot.rotation;
      }
    }
  });

  // 3. Update Camera Follow Mode if Active
  if (SimState.cameraMode === 'follow' && SimState.selectedRobotId) {
    const selectedRobot = SimState.robots.find(r => r.id === SimState.selectedRobotId);
    if (selectedRobot) {
      // Camera sits 3.8m behind and 2.5m above the robot's heading
      const camDist = 3.8;
      const camHeight = 2.4;
      const targetCamX = selectedRobot.x - Math.sin(selectedRobot.rotation) * camDist;
      const targetCamZ = selectedRobot.z - Math.cos(selectedRobot.rotation) * camDist;

      camera.position.lerp(new THREE.Vector3(targetCamX, camHeight, targetCamZ), 0.08);
      controls.target.lerp(new THREE.Vector3(selectedRobot.x, 0.6, selectedRobot.z), 0.1);
    }
  }

  // 4. Update OrbitControls
  controls.update();

  // 5. Update Dynamic 3D Floating HUD Cards & Laser Floor Guides
  updateFloatingHUDs();
  updateLaserGuides();

  // 6. Throttle UI DOM updates to 4 times per second for smooth 60fps rendering
  const now = performance.now();
  if (now - lastUIUpdate > 250) {
    updateUILists();
    lastUIUpdate = now;
  }

  // Live telemetry in robot inspector modal if open
  updateInspectorModalLive();

  // 7. Render 3D Scene
  renderer.render(scene, camera);
}

// Boot application when DOM is ready (supports both early and deferred loading)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
