/**
 * Warehouse Data Model and Configuration
 * Stores layout dimensions, rack arrays, box inventory, AMR definitions, and task state.
 */

const WarehouseConfig = {
  // Dimensions in meters (1 unit = 1 meter)
  width: 32,
  depth: 22,
  wallHeight: 7,

  // Rack configuration
  rackRows: 4,          // 4 aisles of structured racking
  baysPerRow: 6,        // 6 double-bay rack columns per row
  bayWidth: 2.8,        // width of one rack bay
  rackDepth: 1.2,       // depth of pallet rack
  levelsPerRack: 3,     // 3 vertical tiers
  levelHeight: 1.4,     // height of each shelf tier

// Delivery bays / Workstations with dedicated AMR docking approach coordinates
  deliveryBays: [
    { id: 'BAY-1', name: 'Delivery Bay 1', x: -10.0, z: 8.5, dockZ: 6.9 },
    { id: 'BAY-2', name: 'Delivery Bay 2', x: -3.5, z: 8.5, dockZ: 6.9 },
    { id: 'BAY-3', name: 'Delivery Bay 3', x: 3.5, z: 8.5, dockZ: 6.9 },
    { id: 'BAY-4', name: 'Delivery Bay 4', x: 10.0, z: 8.5, dockZ: 6.9 }
  ],

  // Charging Stations
  chargingPads: [
    { id: 'CHG-1', x: -13, z: -8.0 },
    { id: 'CHG-2', x: -13, z: -5.0 },
    { id: 'CHG-3', x: 13, z: -8.0 },
    { id: 'CHG-4', x: 13, z: -5.0 }
  ]
};

// Global Simulation State
const SimState = {
  timeScale: 1.0,
  isPaused: false,
  showHuds: true,
  showLaserGuides: true,
  cameraMode: 'overview', // 'overview', 'follow', 'topdown', 'workstation'
  selectedRobotId: 'robot-1',

  metrics: {
    tasksCompleted: 0,
    collisions: 0,
    deadlocks: 0,
    avgTaskTime: 0,
    totalTaskTime: 0
  },

  // Active AMR Fleet spawned in open staging aisle (Z = 5.5 + 0.44 = 5.94) on two-way route
  robots: [
    {
      id: 'robot-1',
      name: 'ATR-400 #1',
      model: 'ATR-400',
      type: 'courier',
      x: -7,
      z: 5.94,
      targetX: -7,
      targetZ: 5.94,
      rotation: 0,
      targetRotation: 0,
      speed: 0,
      maxSpeed: 1.2,
      acceleration: 0.8,
      turnRate: 2.0,
      battery: 98.4,
      status: 'IDLE',
      payload: 0,
      carriedBox: null,
      currentTask: null,
      waypoints: [],
      waypointIndex: 0,
      odometer: 142.5,
      color: 0x00f2fe,
      liftProgress: 0
    },
    {
      id: 'robot-2',
      name: 'ATR-600 #2',
      model: 'ATR-600',
      type: 'heavy_arm',
      x: 0,
      z: 5.94,
      targetX: 0,
      targetZ: 5.94,
      rotation: 0,
      targetRotation: 0,
      speed: 0,
      maxSpeed: 1.0,
      acceleration: 0.6,
      turnRate: 1.6,
      battery: 94.2,
      status: 'IDLE',
      payload: 0,
      carriedBox: null,
      currentTask: null,
      waypoints: [],
      waypointIndex: 0,
      odometer: 89.1,
      color: 0xf59e0b,
      liftProgress: 0
    },
    {
      id: 'robot-3',
      name: 'ATR-400 #3',
      model: 'ATR-400',
      type: 'courier',
      x: 7,
      z: 5.94,
      targetX: 7,
      targetZ: 5.94,
      rotation: 0,
      targetRotation: 0,
      speed: 0,
      maxSpeed: 1.2,
      acceleration: 0.8,
      turnRate: 2.0,
      battery: 96.8,
      status: 'IDLE',
      payload: 0,
      carriedBox: null,
      currentTask: null,
      waypoints: [],
      waypointIndex: 0,
      odometer: 110.4,
      color: 0x38bdf8,
      liftProgress: 0
    }
  ],

  // Structured Storage Locations and Boxes
  racks: [],
  boxes: [],

  // Task missions queue with safe pickup and delivery docking coordinates
  taskQueue: [
    {
      id: 'TASK-101',
      sku: 'AMZ-BOX-A12',
      category: 'ELECTRONICS',
      weight: 14.5,
      priority: 'P1',
      sourceRack: { aisle: 10, bay: 2, level: 1, x: -7.1, z: -6.5, pickZ: -5.0 },
      targetBay: { id: 'BAY-1', name: 'Delivery Bay 1', x: -10.0, z: 8.5, dockZ: 6.9 },
      assignedRobotId: null,
      status: 'QUEUED',
      createdTime: Date.now()
    },
    {
      id: 'TASK-102',
      sku: 'TOTE-B5',
      category: 'FRAGILE ITEMS',
      weight: 8.2,
      priority: 'P2',
      sourceRack: { aisle: 11, bay: 5, level: 1, x: 3.1, z: -3.5, pickZ: -1.5 },
      targetBay: { id: 'BAY-2', name: 'Delivery Bay 2', x: -3.5, z: 8.5, dockZ: 6.9 },
      assignedRobotId: null,
      status: 'QUEUED',
      createdTime: Date.now()
    },
    {
      id: 'TASK-103',
      sku: 'AMZ-BOX-C88',
      category: 'APPAREL',
      weight: 11.0,
      priority: 'P2',
      sourceRack: { aisle: 12, bay: 3, level: 1, x: -3.7, z: 0.5, pickZ: 2.0 },
      targetBay: { id: 'BAY-3', name: 'Delivery Bay 3', x: 3.5, z: 8.5, dockZ: 6.9 },
      assignedRobotId: null,
      status: 'QUEUED',
      createdTime: Date.now()
    },
    {
      id: 'TASK-104',
      sku: 'AMZ-BOX-D04',
      category: 'HOME GOODS',
      weight: 18.0,
      priority: 'P3',
      sourceRack: { aisle: 13, bay: 6, level: 1, x: 6.5, z: 3.5, pickZ: 5.5 },
      targetBay: { id: 'BAY-4', name: 'Delivery Bay 4', x: 10.0, z: 8.5, dockZ: 6.9 },
      assignedRobotId: null,
      status: 'QUEUED',
      createdTime: Date.now()
    }
  ]
};

// Generate ordered structured rack slots and initial boxes:
// 4 continuous rows (aisles 10-13) with 7 rack bays per row:
// Bay 1: -10.5, Bay 2: -7.1, Bay 3: -3.7, Bay 4: -0.3, Bay 5: 3.1, Bay 6: 6.5, Bay 7: 9.9
// Only Left Highway (X = -13.0) and Right Highway (X = 13.0) can be used to switch aisles!
function initializeWarehouseInventory() {
  const rackZStarts = [-6.5, -3.5, 0.5, 3.5];
  const bayStartX = -10.5;

  let boxCounter = 1;
  const categories = ['ELECTRONICS', 'APPAREL', 'BOOKS', 'HOME', 'TOOLS', 'BEAUTY'];

  rackZStarts.forEach((rz, rowIdx) => {
    const aisleNum = 10 + rowIdx;
    // Determine safe pick aisle adjacent to this rack row
    const pickAisleZ = (rowIdx === 0) ? -5.0 : (rowIdx === 1 ? -1.5 : (rowIdx === 2 ? 2.0 : 5.5));

    for (let bay = 0; bay < 7; bay++) {
      const rx = parseFloat((bayStartX + bay * 3.4).toFixed(2));
      const rackData = {
        id: `RACK-${aisleNum}-${bay + 1}`,
        aisle: aisleNum,
        bay: bay + 1,
        x: rx,
        z: rz,
        pickZ: pickAisleZ,
        slots: []
      };

      // 3 vertical tiers per rack
      for (let lvl = 1; lvl <= 3; lvl++) {
        // 2 slots per shelf tier (left & right)
        for (let s = 0; s < 2; s++) {
          const slotX = rx + (s === 0 ? -0.55 : 0.55);
          const slotY = lvl * 1.0 - 0.45;
          const slotZ = rz;

          const isTote = (boxCounter % 4 === 0);
          const sku = isTote ? `TOTE-B${(boxCounter % 9) + 1}` : `AMZ-BOX-${String.fromCharCode(65 + (boxCounter % 6))}${10 + (boxCounter % 89)}`;
          const category = categories[boxCounter % categories.length];
          const weight = parseFloat((4.0 + (boxCounter * 1.3) % 18).toFixed(1));

          const boxItem = {
            id: `BOX-${boxCounter}`,
            sku: sku,
            category: category,
            weight: weight,
            isTote: isTote,
            rackId: rackData.id,
            aisle: aisleNum,
            bay: bay + 1,
            level: lvl,
            homeX: slotX,
            homeY: slotY,
            homeZ: slotZ,
            pickZ: pickAisleZ,
            currentX: slotX,
            currentY: slotY,
            currentZ: slotZ,
            inTransit: false,
            mesh: null
          };

          rackData.slots.push({
            level: lvl,
            subSlot: s,
            boxId: boxItem.id,
            x: slotX,
            y: slotY,
            z: slotZ
          });

          SimState.boxes.push(boxItem);
          boxCounter++;
        }
      }
      SimState.racks.push(rackData);
    }
  });
}

initializeWarehouseInventory();
