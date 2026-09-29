#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy
import math
import time
from fleet_msgs.msg import RobotPose

class StateListener(Node):
    def __init__(self):
        super().__init__('state_listener')
        self.declare_parameter('robot_id', 'robot_1')
        self.robot_id = self.get_parameter('robot_id').get_parameter_value().string_value

        self.neighbor_table = {}
        self.my_pose = {'x': 0.0, 'y': 0.0, 'yaw': 0.0}

        best_effort_qos = QoSProfile(
            reliability=ReliabilityPolicy.BEST_EFFORT,
            history=HistoryPolicy.KEEP_LAST,
            depth=10
        )

        # Self pose
        self.create_subscription(
            RobotPose, f'/{self.robot_id}/fleet/pose', self.my_pose_callback, best_effort_qos
        )

        # Subscribe to all known fleet robots
        all_robots = ['robot_1', 'robot_2', 'robot_3']
        for rid in all_robots:
            if rid != self.robot_id:
                self.create_subscription(
                    RobotPose, f'/{rid}/fleet/pose',
                    lambda msg, r=rid: self.neighbor_callback(r, msg),
                    best_effort_qos
                )

        # 2 Hz neighbor status logger
        self.timer = self.create_timer(1.0, self.log_neighbors)
        self.get_logger().info(f'StateListener started for [{self.robot_id}], tracking peer robots.')

    def my_pose_callback(self, msg: RobotPose):
        self.my_pose['x'] = msg.x
        self.my_pose['y'] = msg.y
        self.my_pose['yaw'] = msg.yaw

    def neighbor_callback(self, rid, msg: RobotPose):
        self.neighbor_table[rid] = {
            'x': msg.x,
            'y': msg.y,
            'yaw': msg.yaw,
            'velocity': msg.velocity,
            'last_seen': time.time()
        }

    def log_neighbors(self):
        now = time.time()
        for rid, data in self.neighbor_table.items():
            dt = now - data['last_seen']
            if dt < 3.0:
                dist = math.hypot(data['x'] - self.my_pose['x'], data['y'] - self.my_pose['y'])
                self.get_logger().debug(f'[{self.robot_id}] Neighbor {rid}: dist={dist:.2f}m, age={dt:.2f}s')

def main(args=None):
    rclpy.init(args=args)
    node = StateListener()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
