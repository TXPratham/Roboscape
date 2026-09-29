// P2P Inter-robot communication dataset from robot_interaction_dataset.csv
const RobotInteractions = [
  {
    "robot_id": "R52",
    "comm_type": "Robot-to-Human",
    "latency_ms": 43.71,
    "packet_loss": 0.26,
    "jitter_ms": 4.72,
    "throughput_mbps": 471.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R93",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 75.55,
    "packet_loss": 0.83,
    "jitter_ms": 2.52,
    "throughput_mbps": 315.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R15",
    "comm_type": "Robot-to-Network",
    "latency_ms": 33.49,
    "packet_loss": 1.42,
    "jitter_ms": 2.96,
    "throughput_mbps": 532.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R72",
    "comm_type": "Robot-to-Human",
    "latency_ms": 93.4,
    "packet_loss": 0.97,
    "jitter_ms": 1.81,
    "throughput_mbps": 577.3,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R61",
    "comm_type": "Robot-to-Human",
    "latency_ms": 83.39,
    "packet_loss": 0.66,
    "jitter_ms": 1.04,
    "throughput_mbps": 613.5,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R21",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 95.87,
    "packet_loss": 0.21,
    "jitter_ms": 1.78,
    "throughput_mbps": 814.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R83",
    "comm_type": "Robot-to-Human",
    "latency_ms": 59.29,
    "packet_loss": 0.92,
    "jitter_ms": 4.72,
    "throughput_mbps": 582.5,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R87",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 32.39,
    "packet_loss": 0.19,
    "jitter_ms": 2.83,
    "throughput_mbps": 436.7,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R75",
    "comm_type": "Robot-to-Human",
    "latency_ms": 53.91,
    "packet_loss": 0.74,
    "jitter_ms": 1.52,
    "throughput_mbps": 578.7,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R75",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 66.1,
    "packet_loss": 0.23,
    "jitter_ms": 2.81,
    "throughput_mbps": 348.7,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R88",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 95.51,
    "packet_loss": 1.35,
    "jitter_ms": 4.17,
    "throughput_mbps": 980.5,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R100",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 91.81,
    "packet_loss": 1.55,
    "jitter_ms": 3.0,
    "throughput_mbps": 346.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R24",
    "comm_type": "Robot-to-Network",
    "latency_ms": 71.59,
    "packet_loss": 0.49,
    "jitter_ms": 4.75,
    "throughput_mbps": 441.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R3",
    "comm_type": "Robot-to-Human",
    "latency_ms": 81.08,
    "packet_loss": 0.15,
    "jitter_ms": 4.59,
    "throughput_mbps": 599.6,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R22",
    "comm_type": "Robot-to-Network",
    "latency_ms": 96.77,
    "packet_loss": 0.69,
    "jitter_ms": 2.89,
    "throughput_mbps": 953.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R53",
    "comm_type": "Robot-to-Network",
    "latency_ms": 89.54,
    "packet_loss": 1.12,
    "jitter_ms": 1.33,
    "throughput_mbps": 425.1,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Network",
    "latency_ms": 76.12,
    "packet_loss": 1.54,
    "jitter_ms": 3.82,
    "throughput_mbps": 579.8,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R88",
    "comm_type": "Robot-to-Network",
    "latency_ms": 67.8,
    "packet_loss": 0.81,
    "jitter_ms": 2.43,
    "throughput_mbps": 992.5,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R30",
    "comm_type": "Robot-to-Human",
    "latency_ms": 63.32,
    "packet_loss": 0.73,
    "jitter_ms": 4.14,
    "throughput_mbps": 721.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R38",
    "comm_type": "Robot-to-Human",
    "latency_ms": 82.96,
    "packet_loss": 1.82,
    "jitter_ms": 2.24,
    "throughput_mbps": 730.2,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Network",
    "latency_ms": 86.61,
    "packet_loss": 0.9,
    "jitter_ms": 2.32,
    "throughput_mbps": 981.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R64",
    "comm_type": "Robot-to-Human",
    "latency_ms": 45.24,
    "packet_loss": 0.89,
    "jitter_ms": 3.17,
    "throughput_mbps": 654.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R60",
    "comm_type": "Robot-to-Human",
    "latency_ms": 63.18,
    "packet_loss": 0.82,
    "jitter_ms": 1.1,
    "throughput_mbps": 301.8,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R21",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 83.98,
    "packet_loss": 0.73,
    "jitter_ms": 1.68,
    "throughput_mbps": 321.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R33",
    "comm_type": "Robot-to-Human",
    "latency_ms": 77.3,
    "packet_loss": 1.46,
    "jitter_ms": 4.41,
    "throughput_mbps": 777.0,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R76",
    "comm_type": "Robot-to-Network",
    "latency_ms": 71.41,
    "packet_loss": 0.56,
    "jitter_ms": 4.83,
    "throughput_mbps": 448.1,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R58",
    "comm_type": "Robot-to-Human",
    "latency_ms": 52.66,
    "packet_loss": 0.76,
    "jitter_ms": 1.77,
    "throughput_mbps": 634.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R22",
    "comm_type": "Robot-to-Network",
    "latency_ms": 72.65,
    "packet_loss": 0.56,
    "jitter_ms": 4.09,
    "throughput_mbps": 686.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R89",
    "comm_type": "Robot-to-Human",
    "latency_ms": 72.85,
    "packet_loss": 1.14,
    "jitter_ms": 1.45,
    "throughput_mbps": 767.1,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R49",
    "comm_type": "Robot-to-Network",
    "latency_ms": 60.27,
    "packet_loss": 1.92,
    "jitter_ms": 2.89,
    "throughput_mbps": 358.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R91",
    "comm_type": "Robot-to-Human",
    "latency_ms": 97.22,
    "packet_loss": 0.78,
    "jitter_ms": 3.03,
    "throughput_mbps": 832.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R59",
    "comm_type": "Robot-to-Human",
    "latency_ms": 75.72,
    "packet_loss": 1.94,
    "jitter_ms": 3.25,
    "throughput_mbps": 944.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R42",
    "comm_type": "Robot-to-Human",
    "latency_ms": 89.55,
    "packet_loss": 1.31,
    "jitter_ms": 2.45,
    "throughput_mbps": 479.0,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R92",
    "comm_type": "Robot-to-Network",
    "latency_ms": 39.03,
    "packet_loss": 1.59,
    "jitter_ms": 4.42,
    "throughput_mbps": 566.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R60",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 82.97,
    "packet_loss": 0.67,
    "jitter_ms": 2.21,
    "throughput_mbps": 820.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R80",
    "comm_type": "Robot-to-Network",
    "latency_ms": 72.13,
    "packet_loss": 0.45,
    "jitter_ms": 2.94,
    "throughput_mbps": 473.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R15",
    "comm_type": "Robot-to-Human",
    "latency_ms": 51.58,
    "packet_loss": 1.15,
    "jitter_ms": 1.78,
    "throughput_mbps": 679.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Network",
    "latency_ms": 39.55,
    "packet_loss": 1.98,
    "jitter_ms": 3.29,
    "throughput_mbps": 762.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Human",
    "latency_ms": 56.58,
    "packet_loss": 1.42,
    "jitter_ms": 1.79,
    "throughput_mbps": 915.5,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R47",
    "comm_type": "Robot-to-Human",
    "latency_ms": 60.9,
    "packet_loss": 1.36,
    "jitter_ms": 1.97,
    "throughput_mbps": 541.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 39.85,
    "packet_loss": 0.9,
    "jitter_ms": 2.75,
    "throughput_mbps": 644.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R51",
    "comm_type": "Robot-to-Human",
    "latency_ms": 76.91,
    "packet_loss": 1.76,
    "jitter_ms": 2.11,
    "throughput_mbps": 429.2,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R55",
    "comm_type": "Robot-to-Human",
    "latency_ms": 51.5,
    "packet_loss": 1.39,
    "jitter_ms": 1.16,
    "throughput_mbps": 515.3,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R64",
    "comm_type": "Robot-to-Human",
    "latency_ms": 86.42,
    "packet_loss": 1.35,
    "jitter_ms": 4.19,
    "throughput_mbps": 366.5,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R3",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 75.38,
    "packet_loss": 0.59,
    "jitter_ms": 4.28,
    "throughput_mbps": 438.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R51",
    "comm_type": "Robot-to-Network",
    "latency_ms": 51.74,
    "packet_loss": 1.92,
    "jitter_ms": 4.6,
    "throughput_mbps": 542.3,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R7",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 55.2,
    "packet_loss": 0.5,
    "jitter_ms": 4.92,
    "throughput_mbps": 597.0,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R21",
    "comm_type": "Robot-to-Network",
    "latency_ms": 95.95,
    "packet_loss": 1.05,
    "jitter_ms": 1.45,
    "throughput_mbps": 794.8,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R73",
    "comm_type": "Robot-to-Human",
    "latency_ms": 96.37,
    "packet_loss": 0.68,
    "jitter_ms": 2.1,
    "throughput_mbps": 620.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R39",
    "comm_type": "Robot-to-Network",
    "latency_ms": 59.29,
    "packet_loss": 0.36,
    "jitter_ms": 3.52,
    "throughput_mbps": 334.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R18",
    "comm_type": "Robot-to-Network",
    "latency_ms": 77.54,
    "packet_loss": 0.29,
    "jitter_ms": 4.51,
    "throughput_mbps": 829.0,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R4",
    "comm_type": "Robot-to-Network",
    "latency_ms": 98.6,
    "packet_loss": 0.59,
    "jitter_ms": 1.65,
    "throughput_mbps": 673.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R89",
    "comm_type": "Robot-to-Network",
    "latency_ms": 99.58,
    "packet_loss": 1.38,
    "jitter_ms": 2.93,
    "throughput_mbps": 957.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R60",
    "comm_type": "Robot-to-Human",
    "latency_ms": 35.05,
    "packet_loss": 1.95,
    "jitter_ms": 4.92,
    "throughput_mbps": 744.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R14",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 68.74,
    "packet_loss": 1.71,
    "jitter_ms": 2.32,
    "throughput_mbps": 673.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R9",
    "comm_type": "Robot-to-Network",
    "latency_ms": 80.86,
    "packet_loss": 0.44,
    "jitter_ms": 2.96,
    "throughput_mbps": 506.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R90",
    "comm_type": "Robot-to-Human",
    "latency_ms": 43.08,
    "packet_loss": 0.16,
    "jitter_ms": 3.78,
    "throughput_mbps": 465.5,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R53",
    "comm_type": "Robot-to-Human",
    "latency_ms": 87.53,
    "packet_loss": 1.37,
    "jitter_ms": 2.69,
    "throughput_mbps": 461.0,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Human",
    "latency_ms": 62.79,
    "packet_loss": 0.06,
    "jitter_ms": 3.87,
    "throughput_mbps": 585.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R84",
    "comm_type": "Robot-to-Human",
    "latency_ms": 64.84,
    "packet_loss": 1.72,
    "jitter_ms": 1.59,
    "throughput_mbps": 420.0,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R92",
    "comm_type": "Robot-to-Network",
    "latency_ms": 49.2,
    "packet_loss": 1.65,
    "jitter_ms": 1.92,
    "throughput_mbps": 890.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R60",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 51.01,
    "packet_loss": 1.59,
    "jitter_ms": 2.55,
    "throughput_mbps": 863.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R71",
    "comm_type": "Robot-to-Human",
    "latency_ms": 35.89,
    "packet_loss": 1.1,
    "jitter_ms": 4.94,
    "throughput_mbps": 810.2,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R44",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 95.21,
    "packet_loss": 1.95,
    "jitter_ms": 2.4,
    "throughput_mbps": 334.1,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R8",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 56.73,
    "packet_loss": 0.92,
    "jitter_ms": 4.66,
    "throughput_mbps": 350.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R47",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 41.36,
    "packet_loss": 1.97,
    "jitter_ms": 4.5,
    "throughput_mbps": 745.5,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R35",
    "comm_type": "Robot-to-Human",
    "latency_ms": 39.96,
    "packet_loss": 1.76,
    "jitter_ms": 4.02,
    "throughput_mbps": 824.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R78",
    "comm_type": "Robot-to-Human",
    "latency_ms": 58.52,
    "packet_loss": 0.25,
    "jitter_ms": 2.48,
    "throughput_mbps": 318.7,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R81",
    "comm_type": "Robot-to-Human",
    "latency_ms": 74.25,
    "packet_loss": 1.79,
    "jitter_ms": 2.32,
    "throughput_mbps": 503.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R36",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 84.44,
    "packet_loss": 0.61,
    "jitter_ms": 3.56,
    "throughput_mbps": 395.4,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R50",
    "comm_type": "Robot-to-Human",
    "latency_ms": 94.72,
    "packet_loss": 1.54,
    "jitter_ms": 1.93,
    "throughput_mbps": 461.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R4",
    "comm_type": "Robot-to-Human",
    "latency_ms": 74.5,
    "packet_loss": 0.0,
    "jitter_ms": 2.44,
    "throughput_mbps": 662.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 59.45,
    "packet_loss": 0.55,
    "jitter_ms": 4.26,
    "throughput_mbps": 376.5,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R6",
    "comm_type": "Robot-to-Human",
    "latency_ms": 59.54,
    "packet_loss": 1.52,
    "jitter_ms": 1.84,
    "throughput_mbps": 460.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R54",
    "comm_type": "Robot-to-Network",
    "latency_ms": 70.21,
    "packet_loss": 1.94,
    "jitter_ms": 4.31,
    "throughput_mbps": 695.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R4",
    "comm_type": "Robot-to-Network",
    "latency_ms": 67.66,
    "packet_loss": 0.34,
    "jitter_ms": 3.21,
    "throughput_mbps": 655.7,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R54",
    "comm_type": "Robot-to-Network",
    "latency_ms": 74.86,
    "packet_loss": 0.92,
    "jitter_ms": 3.05,
    "throughput_mbps": 900.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R93",
    "comm_type": "Robot-to-Network",
    "latency_ms": 65.24,
    "packet_loss": 1.17,
    "jitter_ms": 3.45,
    "throughput_mbps": 405.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R63",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 34.13,
    "packet_loss": 1.91,
    "jitter_ms": 3.53,
    "throughput_mbps": 558.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R18",
    "comm_type": "Robot-to-Human",
    "latency_ms": 65.05,
    "packet_loss": 0.91,
    "jitter_ms": 3.23,
    "throughput_mbps": 947.1,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R90",
    "comm_type": "Robot-to-Network",
    "latency_ms": 31.58,
    "packet_loss": 1.87,
    "jitter_ms": 3.81,
    "throughput_mbps": 857.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R44",
    "comm_type": "Robot-to-Network",
    "latency_ms": 42.64,
    "packet_loss": 1.96,
    "jitter_ms": 2.43,
    "throughput_mbps": 718.2,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R34",
    "comm_type": "Robot-to-Human",
    "latency_ms": 57.12,
    "packet_loss": 1.88,
    "jitter_ms": 4.24,
    "throughput_mbps": 838.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R74",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 68.59,
    "packet_loss": 1.5,
    "jitter_ms": 1.88,
    "throughput_mbps": 613.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Network",
    "latency_ms": 42.94,
    "packet_loss": 0.25,
    "jitter_ms": 3.86,
    "throughput_mbps": 937.5,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R100",
    "comm_type": "Robot-to-Human",
    "latency_ms": 49.34,
    "packet_loss": 1.2,
    "jitter_ms": 2.54,
    "throughput_mbps": 719.8,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R14",
    "comm_type": "Robot-to-Human",
    "latency_ms": 56.19,
    "packet_loss": 1.51,
    "jitter_ms": 3.78,
    "throughput_mbps": 786.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R95",
    "comm_type": "Robot-to-Network",
    "latency_ms": 43.81,
    "packet_loss": 1.91,
    "jitter_ms": 1.13,
    "throughput_mbps": 756.4,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R48",
    "comm_type": "Robot-to-Network",
    "latency_ms": 99.91,
    "packet_loss": 1.56,
    "jitter_ms": 2.56,
    "throughput_mbps": 770.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R15",
    "comm_type": "Robot-to-Human",
    "latency_ms": 86.33,
    "packet_loss": 1.08,
    "jitter_ms": 4.85,
    "throughput_mbps": 748.7,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R72",
    "comm_type": "Robot-to-Human",
    "latency_ms": 86.77,
    "packet_loss": 0.41,
    "jitter_ms": 3.29,
    "throughput_mbps": 351.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R78",
    "comm_type": "Robot-to-Network",
    "latency_ms": 69.82,
    "packet_loss": 0.91,
    "jitter_ms": 3.0,
    "throughput_mbps": 722.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R87",
    "comm_type": "Robot-to-Network",
    "latency_ms": 97.29,
    "packet_loss": 1.28,
    "jitter_ms": 1.99,
    "throughput_mbps": 848.4,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Network",
    "latency_ms": 81.25,
    "packet_loss": 0.65,
    "jitter_ms": 2.97,
    "throughput_mbps": 300.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R40",
    "comm_type": "Robot-to-Network",
    "latency_ms": 53.16,
    "packet_loss": 0.91,
    "jitter_ms": 4.29,
    "throughput_mbps": 924.2,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R85",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 72.74,
    "packet_loss": 0.03,
    "jitter_ms": 2.35,
    "throughput_mbps": 966.6,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R80",
    "comm_type": "Robot-to-Human",
    "latency_ms": 68.06,
    "packet_loss": 1.76,
    "jitter_ms": 3.26,
    "throughput_mbps": 389.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R82",
    "comm_type": "Robot-to-Network",
    "latency_ms": 70.62,
    "packet_loss": 0.07,
    "jitter_ms": 3.69,
    "throughput_mbps": 674.5,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R53",
    "comm_type": "Robot-to-Human",
    "latency_ms": 87.24,
    "packet_loss": 0.82,
    "jitter_ms": 2.6,
    "throughput_mbps": 377.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R24",
    "comm_type": "Robot-to-Network",
    "latency_ms": 65.67,
    "packet_loss": 1.02,
    "jitter_ms": 2.13,
    "throughput_mbps": 498.1,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R26",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 81.0,
    "packet_loss": 1.94,
    "jitter_ms": 1.62,
    "throughput_mbps": 735.0,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R89",
    "comm_type": "Robot-to-Human",
    "latency_ms": 47.54,
    "packet_loss": 1.87,
    "jitter_ms": 1.4,
    "throughput_mbps": 512.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R60",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 95.24,
    "packet_loss": 1.29,
    "jitter_ms": 1.96,
    "throughput_mbps": 555.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R41",
    "comm_type": "Robot-to-Human",
    "latency_ms": 36.05,
    "packet_loss": 1.17,
    "jitter_ms": 1.08,
    "throughput_mbps": 822.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R29",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 99.55,
    "packet_loss": 0.73,
    "jitter_ms": 4.04,
    "throughput_mbps": 702.5,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R15",
    "comm_type": "Robot-to-Network",
    "latency_ms": 74.29,
    "packet_loss": 0.08,
    "jitter_ms": 1.45,
    "throughput_mbps": 662.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R45",
    "comm_type": "Robot-to-Network",
    "latency_ms": 62.9,
    "packet_loss": 0.54,
    "jitter_ms": 4.6,
    "throughput_mbps": 526.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R65",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 51.75,
    "packet_loss": 1.7,
    "jitter_ms": 3.04,
    "throughput_mbps": 792.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R89",
    "comm_type": "Robot-to-Network",
    "latency_ms": 58.36,
    "packet_loss": 1.3,
    "jitter_ms": 2.83,
    "throughput_mbps": 596.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R71",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 84.77,
    "packet_loss": 1.63,
    "jitter_ms": 1.26,
    "throughput_mbps": 929.2,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R9",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 39.76,
    "packet_loss": 1.67,
    "jitter_ms": 1.53,
    "throughput_mbps": 721.1,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R88",
    "comm_type": "Robot-to-Human",
    "latency_ms": 47.69,
    "packet_loss": 0.12,
    "jitter_ms": 4.43,
    "throughput_mbps": 676.8,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R1",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 38.66,
    "packet_loss": 0.67,
    "jitter_ms": 3.69,
    "throughput_mbps": 862.2,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R8",
    "comm_type": "Robot-to-Human",
    "latency_ms": 59.87,
    "packet_loss": 1.35,
    "jitter_ms": 1.38,
    "throughput_mbps": 639.8,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R88",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 57.11,
    "packet_loss": 1.71,
    "jitter_ms": 3.72,
    "throughput_mbps": 495.5,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R63",
    "comm_type": "Robot-to-Human",
    "latency_ms": 75.41,
    "packet_loss": 1.6,
    "jitter_ms": 1.52,
    "throughput_mbps": 408.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R11",
    "comm_type": "Robot-to-Human",
    "latency_ms": 99.7,
    "packet_loss": 0.84,
    "jitter_ms": 3.93,
    "throughput_mbps": 693.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R81",
    "comm_type": "Robot-to-Network",
    "latency_ms": 92.47,
    "packet_loss": 1.86,
    "jitter_ms": 4.78,
    "throughput_mbps": 597.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R8",
    "comm_type": "Robot-to-Human",
    "latency_ms": 91.63,
    "packet_loss": 0.6,
    "jitter_ms": 4.03,
    "throughput_mbps": 578.2,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R35",
    "comm_type": "Robot-to-Human",
    "latency_ms": 75.2,
    "packet_loss": 0.75,
    "jitter_ms": 4.3,
    "throughput_mbps": 544.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R35",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 48.94,
    "packet_loss": 0.36,
    "jitter_ms": 3.48,
    "throughput_mbps": 770.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R33",
    "comm_type": "Robot-to-Human",
    "latency_ms": 56.89,
    "packet_loss": 0.45,
    "jitter_ms": 1.01,
    "throughput_mbps": 663.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R5",
    "comm_type": "Robot-to-Network",
    "latency_ms": 47.51,
    "packet_loss": 0.02,
    "jitter_ms": 4.14,
    "throughput_mbps": 676.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R41",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 39.46,
    "packet_loss": 0.62,
    "jitter_ms": 2.62,
    "throughput_mbps": 515.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R28",
    "comm_type": "Robot-to-Human",
    "latency_ms": 60.52,
    "packet_loss": 0.61,
    "jitter_ms": 4.49,
    "throughput_mbps": 729.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R7",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 92.83,
    "packet_loss": 0.13,
    "jitter_ms": 3.29,
    "throughput_mbps": 582.5,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R73",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 82.07,
    "packet_loss": 0.68,
    "jitter_ms": 1.77,
    "throughput_mbps": 838.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R72",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 98.94,
    "packet_loss": 0.6,
    "jitter_ms": 1.22,
    "throughput_mbps": 670.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R12",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 43.64,
    "packet_loss": 1.6,
    "jitter_ms": 3.22,
    "throughput_mbps": 502.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R34",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 65.04,
    "packet_loss": 0.31,
    "jitter_ms": 3.27,
    "throughput_mbps": 403.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R33",
    "comm_type": "Robot-to-Human",
    "latency_ms": 85.51,
    "packet_loss": 1.45,
    "jitter_ms": 4.44,
    "throughput_mbps": 790.0,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R48",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 62.23,
    "packet_loss": 0.26,
    "jitter_ms": 1.16,
    "throughput_mbps": 559.8,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R23",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 54.85,
    "packet_loss": 0.99,
    "jitter_ms": 4.29,
    "throughput_mbps": 345.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Network",
    "latency_ms": 87.11,
    "packet_loss": 1.47,
    "jitter_ms": 2.62,
    "throughput_mbps": 940.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R88",
    "comm_type": "Robot-to-Network",
    "latency_ms": 60.12,
    "packet_loss": 1.21,
    "jitter_ms": 3.11,
    "throughput_mbps": 570.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R37",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 93.91,
    "packet_loss": 1.29,
    "jitter_ms": 3.13,
    "throughput_mbps": 822.2,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R99",
    "comm_type": "Robot-to-Human",
    "latency_ms": 48.79,
    "packet_loss": 0.41,
    "jitter_ms": 2.53,
    "throughput_mbps": 621.2,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R44",
    "comm_type": "Robot-to-Network",
    "latency_ms": 92.75,
    "packet_loss": 1.65,
    "jitter_ms": 1.74,
    "throughput_mbps": 923.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R86",
    "comm_type": "Robot-to-Network",
    "latency_ms": 49.49,
    "packet_loss": 1.9,
    "jitter_ms": 1.32,
    "throughput_mbps": 320.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R91",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 50.27,
    "packet_loss": 0.31,
    "jitter_ms": 1.83,
    "throughput_mbps": 481.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R35",
    "comm_type": "Robot-to-Human",
    "latency_ms": 59.44,
    "packet_loss": 1.78,
    "jitter_ms": 3.86,
    "throughput_mbps": 682.0,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R65",
    "comm_type": "Robot-to-Human",
    "latency_ms": 66.11,
    "packet_loss": 0.8,
    "jitter_ms": 3.73,
    "throughput_mbps": 526.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R99",
    "comm_type": "Robot-to-Network",
    "latency_ms": 59.28,
    "packet_loss": 1.4,
    "jitter_ms": 3.7,
    "throughput_mbps": 819.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R47",
    "comm_type": "Robot-to-Network",
    "latency_ms": 90.35,
    "packet_loss": 1.01,
    "jitter_ms": 4.63,
    "throughput_mbps": 781.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R78",
    "comm_type": "Robot-to-Network",
    "latency_ms": 85.69,
    "packet_loss": 1.59,
    "jitter_ms": 2.83,
    "throughput_mbps": 317.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R3",
    "comm_type": "Robot-to-Network",
    "latency_ms": 51.69,
    "packet_loss": 0.09,
    "jitter_ms": 4.04,
    "throughput_mbps": 720.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R1",
    "comm_type": "Robot-to-Network",
    "latency_ms": 65.81,
    "packet_loss": 0.65,
    "jitter_ms": 3.67,
    "throughput_mbps": 885.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R5",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 60.17,
    "packet_loss": 0.09,
    "jitter_ms": 4.75,
    "throughput_mbps": 520.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R90",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 33.92,
    "packet_loss": 1.88,
    "jitter_ms": 3.68,
    "throughput_mbps": 397.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R14",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 82.37,
    "packet_loss": 0.34,
    "jitter_ms": 1.72,
    "throughput_mbps": 816.8,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R27",
    "comm_type": "Robot-to-Network",
    "latency_ms": 42.72,
    "packet_loss": 0.85,
    "jitter_ms": 3.98,
    "throughput_mbps": 930.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R9",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 95.39,
    "packet_loss": 1.28,
    "jitter_ms": 2.43,
    "throughput_mbps": 759.8,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R79",
    "comm_type": "Robot-to-Network",
    "latency_ms": 57.84,
    "packet_loss": 0.92,
    "jitter_ms": 2.02,
    "throughput_mbps": 892.2,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R15",
    "comm_type": "Robot-to-Human",
    "latency_ms": 73.56,
    "packet_loss": 1.07,
    "jitter_ms": 2.11,
    "throughput_mbps": 999.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R90",
    "comm_type": "Robot-to-Human",
    "latency_ms": 87.28,
    "packet_loss": 0.41,
    "jitter_ms": 4.3,
    "throughput_mbps": 649.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R42",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 42.62,
    "packet_loss": 0.13,
    "jitter_ms": 2.81,
    "throughput_mbps": 954.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R77",
    "comm_type": "Robot-to-Human",
    "latency_ms": 67.88,
    "packet_loss": 0.51,
    "jitter_ms": 2.88,
    "throughput_mbps": 541.1,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R51",
    "comm_type": "Robot-to-Human",
    "latency_ms": 46.62,
    "packet_loss": 0.63,
    "jitter_ms": 1.04,
    "throughput_mbps": 822.0,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R63",
    "comm_type": "Robot-to-Human",
    "latency_ms": 65.68,
    "packet_loss": 0.83,
    "jitter_ms": 2.08,
    "throughput_mbps": 931.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R96",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 70.56,
    "packet_loss": 0.59,
    "jitter_ms": 4.53,
    "throughput_mbps": 664.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R52",
    "comm_type": "Robot-to-Human",
    "latency_ms": 41.84,
    "packet_loss": 0.07,
    "jitter_ms": 2.99,
    "throughput_mbps": 738.5,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R96",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 70.66,
    "packet_loss": 0.19,
    "jitter_ms": 2.67,
    "throughput_mbps": 979.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R4",
    "comm_type": "Robot-to-Network",
    "latency_ms": 61.84,
    "packet_loss": 1.35,
    "jitter_ms": 1.3,
    "throughput_mbps": 475.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R94",
    "comm_type": "Robot-to-Network",
    "latency_ms": 66.54,
    "packet_loss": 0.13,
    "jitter_ms": 2.17,
    "throughput_mbps": 549.2,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R23",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 93.35,
    "packet_loss": 0.09,
    "jitter_ms": 1.52,
    "throughput_mbps": 840.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R15",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 63.87,
    "packet_loss": 1.62,
    "jitter_ms": 1.66,
    "throughput_mbps": 538.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R43",
    "comm_type": "Robot-to-Human",
    "latency_ms": 63.33,
    "packet_loss": 0.08,
    "jitter_ms": 2.36,
    "throughput_mbps": 650.5,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R29",
    "comm_type": "Robot-to-Network",
    "latency_ms": 62.93,
    "packet_loss": 0.14,
    "jitter_ms": 1.27,
    "throughput_mbps": 335.3,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R36",
    "comm_type": "Robot-to-Human",
    "latency_ms": 73.62,
    "packet_loss": 1.1,
    "jitter_ms": 4.11,
    "throughput_mbps": 695.8,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R13",
    "comm_type": "Robot-to-Network",
    "latency_ms": 55.73,
    "packet_loss": 0.89,
    "jitter_ms": 3.49,
    "throughput_mbps": 738.7,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R32",
    "comm_type": "Robot-to-Human",
    "latency_ms": 86.1,
    "packet_loss": 1.93,
    "jitter_ms": 4.2,
    "throughput_mbps": 357.8,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R71",
    "comm_type": "Robot-to-Human",
    "latency_ms": 50.02,
    "packet_loss": 1.87,
    "jitter_ms": 2.39,
    "throughput_mbps": 470.7,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R59",
    "comm_type": "Robot-to-Network",
    "latency_ms": 50.97,
    "packet_loss": 1.32,
    "jitter_ms": 1.89,
    "throughput_mbps": 603.2,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R86",
    "comm_type": "Robot-to-Human",
    "latency_ms": 71.21,
    "packet_loss": 0.14,
    "jitter_ms": 3.36,
    "throughput_mbps": 846.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R28",
    "comm_type": "Robot-to-Network",
    "latency_ms": 48.19,
    "packet_loss": 1.01,
    "jitter_ms": 1.09,
    "throughput_mbps": 315.2,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R66",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 36.3,
    "packet_loss": 0.09,
    "jitter_ms": 1.36,
    "throughput_mbps": 531.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R42",
    "comm_type": "Robot-to-Human",
    "latency_ms": 44.39,
    "packet_loss": 1.82,
    "jitter_ms": 3.97,
    "throughput_mbps": 303.4,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R45",
    "comm_type": "Robot-to-Network",
    "latency_ms": 93.96,
    "packet_loss": 1.32,
    "jitter_ms": 4.55,
    "throughput_mbps": 664.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Network",
    "latency_ms": 30.75,
    "packet_loss": 1.15,
    "jitter_ms": 1.82,
    "throughput_mbps": 649.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R57",
    "comm_type": "Robot-to-Human",
    "latency_ms": 39.34,
    "packet_loss": 0.86,
    "jitter_ms": 4.16,
    "throughput_mbps": 828.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R6",
    "comm_type": "Robot-to-Network",
    "latency_ms": 83.06,
    "packet_loss": 1.02,
    "jitter_ms": 2.53,
    "throughput_mbps": 302.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R28",
    "comm_type": "Robot-to-Human",
    "latency_ms": 98.59,
    "packet_loss": 0.8,
    "jitter_ms": 2.66,
    "throughput_mbps": 831.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R28",
    "comm_type": "Robot-to-Human",
    "latency_ms": 78.17,
    "packet_loss": 0.2,
    "jitter_ms": 4.54,
    "throughput_mbps": 923.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R44",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 94.56,
    "packet_loss": 1.32,
    "jitter_ms": 3.48,
    "throughput_mbps": 522.2,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R84",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 89.87,
    "packet_loss": 1.99,
    "jitter_ms": 4.25,
    "throughput_mbps": 533.6,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R30",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 63.6,
    "packet_loss": 0.22,
    "jitter_ms": 4.1,
    "throughput_mbps": 300.7,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Human",
    "latency_ms": 53.35,
    "packet_loss": 1.99,
    "jitter_ms": 3.3,
    "throughput_mbps": 600.4,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R75",
    "comm_type": "Robot-to-Human",
    "latency_ms": 74.26,
    "packet_loss": 1.8,
    "jitter_ms": 3.99,
    "throughput_mbps": 729.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R92",
    "comm_type": "Robot-to-Network",
    "latency_ms": 67.35,
    "packet_loss": 1.79,
    "jitter_ms": 3.83,
    "throughput_mbps": 385.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R89",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 31.81,
    "packet_loss": 1.66,
    "jitter_ms": 2.92,
    "throughput_mbps": 760.0,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 97.01,
    "packet_loss": 1.85,
    "jitter_ms": 1.61,
    "throughput_mbps": 556.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R97",
    "comm_type": "Robot-to-Network",
    "latency_ms": 69.92,
    "packet_loss": 0.49,
    "jitter_ms": 2.07,
    "throughput_mbps": 771.1,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R1",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 91.21,
    "packet_loss": 0.87,
    "jitter_ms": 2.51,
    "throughput_mbps": 475.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R27",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 81.42,
    "packet_loss": 0.96,
    "jitter_ms": 3.35,
    "throughput_mbps": 842.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 53.86,
    "packet_loss": 0.14,
    "jitter_ms": 2.19,
    "throughput_mbps": 684.2,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R77",
    "comm_type": "Robot-to-Network",
    "latency_ms": 93.08,
    "packet_loss": 1.96,
    "jitter_ms": 1.82,
    "throughput_mbps": 673.2,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R3",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 85.33,
    "packet_loss": 1.38,
    "jitter_ms": 1.14,
    "throughput_mbps": 641.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R70",
    "comm_type": "Robot-to-Human",
    "latency_ms": 60.09,
    "packet_loss": 0.9,
    "jitter_ms": 1.85,
    "throughput_mbps": 889.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R72",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 88.83,
    "packet_loss": 1.98,
    "jitter_ms": 3.16,
    "throughput_mbps": 688.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R27",
    "comm_type": "Robot-to-Human",
    "latency_ms": 49.01,
    "packet_loss": 0.54,
    "jitter_ms": 1.56,
    "throughput_mbps": 411.7,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R9",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 76.95,
    "packet_loss": 0.67,
    "jitter_ms": 1.12,
    "throughput_mbps": 738.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Human",
    "latency_ms": 38.02,
    "packet_loss": 0.38,
    "jitter_ms": 1.3,
    "throughput_mbps": 659.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R37",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 90.6,
    "packet_loss": 0.37,
    "jitter_ms": 4.81,
    "throughput_mbps": 348.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R97",
    "comm_type": "Robot-to-Human",
    "latency_ms": 81.06,
    "packet_loss": 0.38,
    "jitter_ms": 1.14,
    "throughput_mbps": 706.8,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R51",
    "comm_type": "Robot-to-Human",
    "latency_ms": 40.68,
    "packet_loss": 1.22,
    "jitter_ms": 2.89,
    "throughput_mbps": 355.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R44",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 31.49,
    "packet_loss": 0.59,
    "jitter_ms": 3.75,
    "throughput_mbps": 807.4,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R24",
    "comm_type": "Robot-to-Network",
    "latency_ms": 57.29,
    "packet_loss": 1.9,
    "jitter_ms": 1.89,
    "throughput_mbps": 758.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R79",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 77.27,
    "packet_loss": 1.63,
    "jitter_ms": 4.86,
    "throughput_mbps": 645.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R59",
    "comm_type": "Robot-to-Network",
    "latency_ms": 49.82,
    "packet_loss": 0.32,
    "jitter_ms": 1.09,
    "throughput_mbps": 824.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R32",
    "comm_type": "Robot-to-Network",
    "latency_ms": 98.13,
    "packet_loss": 1.67,
    "jitter_ms": 4.52,
    "throughput_mbps": 496.5,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R96",
    "comm_type": "Robot-to-Network",
    "latency_ms": 95.43,
    "packet_loss": 0.69,
    "jitter_ms": 2.57,
    "throughput_mbps": 612.5,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R88",
    "comm_type": "Robot-to-Network",
    "latency_ms": 71.86,
    "packet_loss": 0.46,
    "jitter_ms": 2.54,
    "throughput_mbps": 310.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R52",
    "comm_type": "Robot-to-Network",
    "latency_ms": 52.09,
    "packet_loss": 1.56,
    "jitter_ms": 2.89,
    "throughput_mbps": 991.8,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R62",
    "comm_type": "Robot-to-Network",
    "latency_ms": 92.74,
    "packet_loss": 1.71,
    "jitter_ms": 4.89,
    "throughput_mbps": 339.4,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R58",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 86.24,
    "packet_loss": 1.92,
    "jitter_ms": 3.51,
    "throughput_mbps": 373.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R52",
    "comm_type": "Robot-to-Human",
    "latency_ms": 36.03,
    "packet_loss": 0.84,
    "jitter_ms": 4.51,
    "throughput_mbps": 646.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R12",
    "comm_type": "Robot-to-Human",
    "latency_ms": 63.34,
    "packet_loss": 1.12,
    "jitter_ms": 1.11,
    "throughput_mbps": 563.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R39",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 98.69,
    "packet_loss": 1.23,
    "jitter_ms": 4.59,
    "throughput_mbps": 672.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 61.77,
    "packet_loss": 1.26,
    "jitter_ms": 1.85,
    "throughput_mbps": 884.5,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R3",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 95.3,
    "packet_loss": 0.8,
    "jitter_ms": 2.26,
    "throughput_mbps": 411.0,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R56",
    "comm_type": "Robot-to-Network",
    "latency_ms": 98.41,
    "packet_loss": 0.3,
    "jitter_ms": 1.29,
    "throughput_mbps": 747.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R81",
    "comm_type": "Robot-to-Network",
    "latency_ms": 57.12,
    "packet_loss": 0.14,
    "jitter_ms": 4.66,
    "throughput_mbps": 312.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R59",
    "comm_type": "Robot-to-Human",
    "latency_ms": 97.52,
    "packet_loss": 1.81,
    "jitter_ms": 3.1,
    "throughput_mbps": 853.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 39.66,
    "packet_loss": 0.73,
    "jitter_ms": 1.36,
    "throughput_mbps": 870.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Human",
    "latency_ms": 41.21,
    "packet_loss": 0.36,
    "jitter_ms": 2.59,
    "throughput_mbps": 565.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R92",
    "comm_type": "Robot-to-Human",
    "latency_ms": 49.36,
    "packet_loss": 1.97,
    "jitter_ms": 2.52,
    "throughput_mbps": 421.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R54",
    "comm_type": "Robot-to-Network",
    "latency_ms": 62.73,
    "packet_loss": 1.61,
    "jitter_ms": 1.2,
    "throughput_mbps": 867.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R87",
    "comm_type": "Robot-to-Network",
    "latency_ms": 42.67,
    "packet_loss": 1.96,
    "jitter_ms": 2.39,
    "throughput_mbps": 936.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R96",
    "comm_type": "Robot-to-Human",
    "latency_ms": 53.81,
    "packet_loss": 0.56,
    "jitter_ms": 2.17,
    "throughput_mbps": 352.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R97",
    "comm_type": "Robot-to-Network",
    "latency_ms": 37.26,
    "packet_loss": 0.93,
    "jitter_ms": 4.68,
    "throughput_mbps": 705.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R1",
    "comm_type": "Robot-to-Network",
    "latency_ms": 60.1,
    "packet_loss": 1.62,
    "jitter_ms": 4.23,
    "throughput_mbps": 956.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R19",
    "comm_type": "Robot-to-Network",
    "latency_ms": 87.92,
    "packet_loss": 1.1,
    "jitter_ms": 1.64,
    "throughput_mbps": 750.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Human",
    "latency_ms": 71.65,
    "packet_loss": 0.71,
    "jitter_ms": 4.73,
    "throughput_mbps": 874.2,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R53",
    "comm_type": "Robot-to-Human",
    "latency_ms": 86.71,
    "packet_loss": 0.32,
    "jitter_ms": 3.97,
    "throughput_mbps": 460.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R44",
    "comm_type": "Robot-to-Human",
    "latency_ms": 39.5,
    "packet_loss": 1.12,
    "jitter_ms": 2.96,
    "throughput_mbps": 371.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R90",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 57.96,
    "packet_loss": 1.2,
    "jitter_ms": 2.73,
    "throughput_mbps": 563.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R32",
    "comm_type": "Robot-to-Human",
    "latency_ms": 32.75,
    "packet_loss": 1.44,
    "jitter_ms": 4.71,
    "throughput_mbps": 576.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R70",
    "comm_type": "Robot-to-Network",
    "latency_ms": 55.9,
    "packet_loss": 1.58,
    "jitter_ms": 2.22,
    "throughput_mbps": 850.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R32",
    "comm_type": "Robot-to-Human",
    "latency_ms": 73.01,
    "packet_loss": 0.24,
    "jitter_ms": 2.48,
    "throughput_mbps": 584.4,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R68",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 69.82,
    "packet_loss": 1.26,
    "jitter_ms": 3.76,
    "throughput_mbps": 465.6,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R55",
    "comm_type": "Robot-to-Network",
    "latency_ms": 34.22,
    "packet_loss": 1.56,
    "jitter_ms": 4.04,
    "throughput_mbps": 920.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R75",
    "comm_type": "Robot-to-Human",
    "latency_ms": 34.34,
    "packet_loss": 0.78,
    "jitter_ms": 2.31,
    "throughput_mbps": 847.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R56",
    "comm_type": "Robot-to-Human",
    "latency_ms": 51.35,
    "packet_loss": 0.55,
    "jitter_ms": 4.69,
    "throughput_mbps": 767.1,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R17",
    "comm_type": "Robot-to-Network",
    "latency_ms": 84.0,
    "packet_loss": 0.96,
    "jitter_ms": 2.02,
    "throughput_mbps": 445.0,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R38",
    "comm_type": "Robot-to-Human",
    "latency_ms": 31.44,
    "packet_loss": 0.62,
    "jitter_ms": 2.39,
    "throughput_mbps": 443.4,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R24",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 73.11,
    "packet_loss": 1.02,
    "jitter_ms": 1.79,
    "throughput_mbps": 643.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R69",
    "comm_type": "Robot-to-Network",
    "latency_ms": 42.86,
    "packet_loss": 0.62,
    "jitter_ms": 3.15,
    "throughput_mbps": 671.6,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R98",
    "comm_type": "Robot-to-Human",
    "latency_ms": 96.1,
    "packet_loss": 0.85,
    "jitter_ms": 5.0,
    "throughput_mbps": 479.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R70",
    "comm_type": "Robot-to-Network",
    "latency_ms": 60.12,
    "packet_loss": 1.83,
    "jitter_ms": 3.87,
    "throughput_mbps": 386.4,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R86",
    "comm_type": "Robot-to-Human",
    "latency_ms": 33.35,
    "packet_loss": 1.83,
    "jitter_ms": 2.89,
    "throughput_mbps": 554.2,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R11",
    "comm_type": "Robot-to-Human",
    "latency_ms": 79.95,
    "packet_loss": 1.98,
    "jitter_ms": 4.93,
    "throughput_mbps": 600.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R16",
    "comm_type": "Robot-to-Network",
    "latency_ms": 63.92,
    "packet_loss": 0.97,
    "jitter_ms": 1.2,
    "throughput_mbps": 336.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R97",
    "comm_type": "Robot-to-Human",
    "latency_ms": 91.69,
    "packet_loss": 0.34,
    "jitter_ms": 2.14,
    "throughput_mbps": 695.2,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R73",
    "comm_type": "Robot-to-Human",
    "latency_ms": 75.63,
    "packet_loss": 1.78,
    "jitter_ms": 4.35,
    "throughput_mbps": 301.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R59",
    "comm_type": "Robot-to-Network",
    "latency_ms": 78.48,
    "packet_loss": 1.19,
    "jitter_ms": 3.1,
    "throughput_mbps": 405.8,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R70",
    "comm_type": "Robot-to-Human",
    "latency_ms": 83.71,
    "packet_loss": 1.5,
    "jitter_ms": 1.02,
    "throughput_mbps": 402.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R80",
    "comm_type": "Robot-to-Human",
    "latency_ms": 59.42,
    "packet_loss": 0.33,
    "jitter_ms": 2.83,
    "throughput_mbps": 781.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R93",
    "comm_type": "Robot-to-Network",
    "latency_ms": 85.48,
    "packet_loss": 0.64,
    "jitter_ms": 1.09,
    "throughput_mbps": 640.1,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R3",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 33.54,
    "packet_loss": 0.55,
    "jitter_ms": 3.29,
    "throughput_mbps": 885.2,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R20",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 83.59,
    "packet_loss": 1.12,
    "jitter_ms": 3.53,
    "throughput_mbps": 485.4,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R59",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 74.54,
    "packet_loss": 1.99,
    "jitter_ms": 1.81,
    "throughput_mbps": 447.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R36",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 69.67,
    "packet_loss": 1.22,
    "jitter_ms": 4.95,
    "throughput_mbps": 862.0,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R19",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 52.27,
    "packet_loss": 1.15,
    "jitter_ms": 4.34,
    "throughput_mbps": 610.9,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R90",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 37.99,
    "packet_loss": 1.52,
    "jitter_ms": 2.86,
    "throughput_mbps": 492.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R67",
    "comm_type": "Robot-to-Network",
    "latency_ms": 75.3,
    "packet_loss": 0.66,
    "jitter_ms": 2.24,
    "throughput_mbps": 592.8,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R19",
    "comm_type": "Robot-to-Network",
    "latency_ms": 63.02,
    "packet_loss": 0.51,
    "jitter_ms": 1.05,
    "throughput_mbps": 597.7,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R20",
    "comm_type": "Robot-to-Network",
    "latency_ms": 45.25,
    "packet_loss": 1.68,
    "jitter_ms": 3.77,
    "throughput_mbps": 700.5,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R96",
    "comm_type": "Robot-to-Human",
    "latency_ms": 33.04,
    "packet_loss": 1.92,
    "jitter_ms": 2.05,
    "throughput_mbps": 326.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R71",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 67.71,
    "packet_loss": 0.84,
    "jitter_ms": 2.58,
    "throughput_mbps": 473.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R52",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 38.84,
    "packet_loss": 0.08,
    "jitter_ms": 2.71,
    "throughput_mbps": 626.8,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R33",
    "comm_type": "Robot-to-Network",
    "latency_ms": 95.06,
    "packet_loss": 0.36,
    "jitter_ms": 4.42,
    "throughput_mbps": 679.6,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R40",
    "comm_type": "Robot-to-Human",
    "latency_ms": 40.54,
    "packet_loss": 1.71,
    "jitter_ms": 4.41,
    "throughput_mbps": 411.1,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R39",
    "comm_type": "Robot-to-Human",
    "latency_ms": 32.24,
    "packet_loss": 0.24,
    "jitter_ms": 4.1,
    "throughput_mbps": 435.5,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R82",
    "comm_type": "Robot-to-Network",
    "latency_ms": 48.34,
    "packet_loss": 1.53,
    "jitter_ms": 4.07,
    "throughput_mbps": 809.3,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R1",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 42.25,
    "packet_loss": 1.24,
    "jitter_ms": 2.98,
    "throughput_mbps": 849.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R11",
    "comm_type": "Robot-to-Human",
    "latency_ms": 85.39,
    "packet_loss": 1.45,
    "jitter_ms": 4.16,
    "throughput_mbps": 352.6,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R92",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 50.25,
    "packet_loss": 0.51,
    "jitter_ms": 4.43,
    "throughput_mbps": 993.1,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R57",
    "comm_type": "Robot-to-Human",
    "latency_ms": 47.17,
    "packet_loss": 0.04,
    "jitter_ms": 2.99,
    "throughput_mbps": 603.2,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R89",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 99.64,
    "packet_loss": 0.08,
    "jitter_ms": 4.6,
    "throughput_mbps": 710.0,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R50",
    "comm_type": "Robot-to-Human",
    "latency_ms": 40.5,
    "packet_loss": 1.45,
    "jitter_ms": 4.96,
    "throughput_mbps": 715.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R23",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 35.95,
    "packet_loss": 1.23,
    "jitter_ms": 1.7,
    "throughput_mbps": 542.2,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R31",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 51.39,
    "packet_loss": 1.68,
    "jitter_ms": 4.92,
    "throughput_mbps": 681.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R94",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 58.36,
    "packet_loss": 0.8,
    "jitter_ms": 1.98,
    "throughput_mbps": 708.4,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R42",
    "comm_type": "Robot-to-Network",
    "latency_ms": 83.23,
    "packet_loss": 1.11,
    "jitter_ms": 4.74,
    "throughput_mbps": 832.5,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R99",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 96.88,
    "packet_loss": 1.57,
    "jitter_ms": 4.4,
    "throughput_mbps": 763.3,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R7",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 83.46,
    "packet_loss": 0.99,
    "jitter_ms": 4.66,
    "throughput_mbps": 612.7,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R16",
    "comm_type": "Robot-to-Human",
    "latency_ms": 80.86,
    "packet_loss": 1.99,
    "jitter_ms": 2.84,
    "throughput_mbps": 433.9,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R90",
    "comm_type": "Robot-to-Human",
    "latency_ms": 99.4,
    "packet_loss": 1.49,
    "jitter_ms": 1.6,
    "throughput_mbps": 317.6,
    "task_type": "Inspection"
  },
  {
    "robot_id": "R60",
    "comm_type": "Robot-to-Network",
    "latency_ms": 83.58,
    "packet_loss": 1.37,
    "jitter_ms": 1.89,
    "throughput_mbps": 756.3,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R2",
    "comm_type": "Robot-to-Human",
    "latency_ms": 39.77,
    "packet_loss": 1.6,
    "jitter_ms": 2.22,
    "throughput_mbps": 634.4,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R1",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 62.31,
    "packet_loss": 1.55,
    "jitter_ms": 2.0,
    "throughput_mbps": 975.9,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R48",
    "comm_type": "Robot-to-Network",
    "latency_ms": 65.25,
    "packet_loss": 0.44,
    "jitter_ms": 4.87,
    "throughput_mbps": 368.8,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R12",
    "comm_type": "Robot-to-Network",
    "latency_ms": 51.34,
    "packet_loss": 0.42,
    "jitter_ms": 1.62,
    "throughput_mbps": 350.8,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R69",
    "comm_type": "Robot-to-Network",
    "latency_ms": 41.5,
    "packet_loss": 1.21,
    "jitter_ms": 3.74,
    "throughput_mbps": 426.9,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R37",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 79.82,
    "packet_loss": 0.87,
    "jitter_ms": 3.05,
    "throughput_mbps": 563.8,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R32",
    "comm_type": "Robot-to-Robot",
    "latency_ms": 49.42,
    "packet_loss": 1.74,
    "jitter_ms": 1.14,
    "throughput_mbps": 422.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R9",
    "comm_type": "Robot-to-Human",
    "latency_ms": 73.73,
    "packet_loss": 0.58,
    "jitter_ms": 1.85,
    "throughput_mbps": 624.7,
    "task_type": "Collaboration"
  },
  {
    "robot_id": "R99",
    "comm_type": "Robot-to-Human",
    "latency_ms": 52.58,
    "packet_loss": 0.66,
    "jitter_ms": 4.73,
    "throughput_mbps": 537.8,
    "task_type": "Object Manipulation"
  },
  {
    "robot_id": "R19",
    "comm_type": "Robot-to-Human",
    "latency_ms": 65.44,
    "packet_loss": 0.33,
    "jitter_ms": 4.27,
    "throughput_mbps": 999.6,
    "task_type": "Navigation"
  },
  {
    "robot_id": "R48",
    "comm_type": "Robot-to-Network",
    "latency_ms": 53.59,
    "packet_loss": 1.96,
    "jitter_ms": 3.34,
    "throughput_mbps": 976.7,
    "task_type": "Inspection"
  }
];
