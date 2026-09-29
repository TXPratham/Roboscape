#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from fleet_msgs.msg import BlockedAisle, PathIntent, RobotPose, TaskAnnouncement
import math
import time

class RerouteNode(Node):
    def __init__(self):
        super().__init__('reroute_node')
        self.declare_parameter('robot_id', 'robot_1')
        self.robot_id = self.get_parameter('robot_id').get_parameter_value().string_value

        self.my_pose = {'x': 0.0, 'y': 0.0}
        self.active_path = [] # list of (x, y)

        self.path_pub = self.create_publisher(PathIntent, f'/{self.robot_id}/fleet/path_intent', 10)
        self.task_retry_pub = self.create_publisher(TaskAnnouncement, '/fleet/task_requests', 10)
        self.nav_status_pub = self.create_publisher(String, f'/{self.robot_id}/nav_status', 10)

        self.create_subscription(RobotPose, f'/{self.robot_id}/fleet/pose', self.pose_cb, 10)
        self.create_subscription(BlockedAisle, '/fleet/blocked_aisles', self.blocked_aisle_cb, 10)

        self.get_logger().info(f'RerouteNode initialized for [{self.robot_id}]. Listening for BlockedAisle events.')

    def pose_cb(self, msg: RobotPose):
        self.my_pose['x'] = msg.x
        self.my_pose['y'] = msg.y

    def blocked_aisle_cb(self, msg: BlockedAisle):
        dist = math.hypot(msg.x - self.my_pose['x'], msg.y - self.my_pose['y'])
        self.get_logger().warn(f'[{self.robot_id}] Received BlockedAisle: {msg.aisle_id} at ({msg.x:.2f}, {msg.y:.2f}), dist={dist:.2f}m')

        if dist < 6.0:
            # Trigger D* Lite re-route avoiding the blocked coordinates
            self.get_logger().info(f'[{self.robot_id}] Incurring detour to avoid blocked region {msg.aisle_id}')
            
            # Generate detour waypoints
            detour_x = [self.my_pose['x'], self.my_pose['x'] + 2.0, msg.x + 3.0]
            detour_y = [self.my_pose['y'], self.my_pose['y'] + 1.0, msg.y]

            intent = PathIntent()
            intent.robot_id = self.robot_id
            intent.waypoints_x = detour_x
            intent.waypoints_y = detour_y
            intent.priority = 2
            intent.timestamp = time.time()
            self.path_pub.publish(intent)

            status = String()
            status.data = f'REROUTING_DSTAR_LITE:{msg.aisle_id}'
            self.nav_status_pub.publish(status)

def main(args=None):
    rclpy.init(args=args)
    node = RerouteNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
