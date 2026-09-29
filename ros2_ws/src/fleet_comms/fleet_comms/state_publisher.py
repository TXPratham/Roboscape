#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy
import math
import time
from nav_msgs.msg import Odometry
from fleet_msgs.msg import RobotPose, BatteryStatus

class StatePublisher(Node):
    def __init__(self):
        super().__init__('state_publisher')
        self.declare_parameter('robot_id', 'robot_1')
        self.robot_id = self.get_parameter('robot_id').get_parameter_value().string_value

        # High frequency BEST_EFFORT QoS for pose updates
        best_effort_qos = QoSProfile(
            reliability=ReliabilityPolicy.BEST_EFFORT,
            history=HistoryPolicy.KEEP_LAST,
            depth=10
        )

        self.pose_pub = self.create_publisher(RobotPose, f'/{self.robot_id}/fleet/pose', best_effort_qos)
        self.battery_pub = self.create_publisher(BatteryStatus, f'/{self.robot_id}/fleet/battery', 10)

        self.odom_sub = self.create_subscription(
            Odometry, f'/{self.robot_id}/odom', self.odom_callback, 10
        )

        self.current_x = 0.0
        self.current_y = 0.0
        self.current_yaw = 0.0
        self.current_vel = 0.0
        self.battery_pct = 95.0

        # Periodic publish at 10 Hz
        self.timer = self.create_timer(0.1, self.publish_state)
        self.get_logger().info(f'StatePublisher initialized for [{self.robot_id}] at 10 Hz.')

    def odom_callback(self, msg: Odometry):
        self.current_x = msg.pose.pose.position.x
        self.current_y = msg.pose.pose.position.y
        qz = msg.pose.pose.orientation.z
        qw = msg.pose.pose.orientation.w
        self.current_yaw = 2.0 * math.atan2(qz, qw)
        self.current_vel = msg.twist.twist.linear.x

    def publish_state(self):
        now = time.time()
        pose_msg = RobotPose()
        pose_msg.robot_id = self.robot_id
        pose_msg.x = float(self.current_x)
        pose_msg.y = float(self.current_y)
        pose_msg.yaw = float(self.current_yaw)
        pose_msg.velocity = float(self.current_vel)
        pose_msg.timestamp = now
        self.pose_pub.publish(pose_msg)

        batt_msg = BatteryStatus()
        batt_msg.robot_id = self.robot_id
        batt_msg.percentage = float(self.battery_pct)
        batt_msg.voltage = float(24.0 + (self.battery_pct / 100.0) * 1.5)
        batt_msg.timestamp = now
        self.battery_pub.publish(batt_msg)

def main(args=None):
    rclpy.init(args=args)
    node = StatePublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
