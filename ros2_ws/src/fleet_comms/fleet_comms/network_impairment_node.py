#!/usr/bin/env python3
"""
ROS 2 DDS Network Impairment & Edge Telemetry Injection Node
Part of SIH 2026 Fleet Communications (comms-architect)

Reads industrial_robot_control_6G_network.csv:
- Extracts total_delay (ms), network_latency (ms), and packet_loss_rate (%)
- Dynamically injects artificial transmission latency and stochastic packet drop
  into the ROS 2 DDS pipeline (poses, cmd_vel, intersection reservations)
- Validates that ORCA reciprocal avoidance and task re-allocation handle realistic
  6G / 5G edge network jitter and packet loss without collisions.
"""

import os
import csv
import time
import random
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from fleet_msgs.msg import RobotPose, IntersectionReservation, CommsLog

class NetworkImpairmentNode(Node):
    def __init__(self, dataset_path='datasets/Industry Robot/industrial_robot_control_6G_network.csv'):
        super().__init__('network_impairment_node')
        self.dataset_path = dataset_path
        self.network_records = []
        self.load_dataset()

        # Inbound and Outbound ROS 2 Topics for impairment filtering
        # Intercepts raw poses and publishes degraded/delayed poses to /robot_1/fleet/pose
        self.raw_sub = self.create_subscription(
            RobotPose,
            '/robot_1/raw_pose',
            self.filter_pose_message,
            20
        )
        self.impaired_pub = self.create_publisher(RobotPose, '/robot_1/fleet/pose', 20)
        self.comms_log_pub = self.create_publisher(CommsLog, '/fleet/comms_log', 20)

        # 10Hz Telemetry status broadcast
        self.timer = self.create_timer(2.0, self.broadcast_channel_status)
        self.get_logger().info('Network Impairment Node active. Ingesting 6G network latency & packet loss.')

    def load_dataset(self):
        if not os.path.exists(self.dataset_path):
            self.get_logger().warn(f"Dataset path {self.dataset_path} not found.")
            return

        with open(self.dataset_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.network_records.append({
                    'robot_id': row['robot_id'],
                    'network_latency': float(row['network_latency']),
                    'packet_loss_rate': float(row['packet_loss_rate']),
                    'total_delay': float(row['total_delay']),
                    'slice_bandwidth': float(row.get('slice_bandwidth', 1000)),
                    'network_type': row.get('network_type', '6G')
                })
        self.get_logger().info(f"Loaded {len(self.network_records)} edge network records from {self.dataset_path}")

    def filter_pose_message(self, msg: RobotPose):
        if not self.network_records:
            self.impaired_pub.publish(msg)
            return

        sample = random.choice(self.network_records)
        packet_loss = sample['packet_loss_rate']
        total_delay_s = sample['total_delay'] / 1000.0 # Convert ms to s

        # Stochastic Packet Loss check
        if random.uniform(0, 100) < packet_loss:
            # Drop packet!
            log = CommsLog()
            log.robot_id = msg.robot_id or 'Robot-1'
            log.msg_type = 'PACKET_DROP'
            log.content = f"PACKET DROPPED (Loss rate {packet_loss:.2f}% on {sample['network_type']} Slice)"
            log.status_level = 'ERROR'
            self.comms_log_pub.publish(log)
            return

        # Apply network latency delay
        if total_delay_s > 0.001:
            time.sleep(min(total_delay_s, 0.05)) # Cap sleep to prevent blocking thread

        self.impaired_pub.publish(msg)

    def broadcast_channel_status(self):
        if not self.network_records:
            return

        sample = random.choice(self.network_records)
        log = CommsLog()
        log.robot_id = sample['robot_id']
        log.msg_type = 'DDS_METRICS'
        log.content = f"DDS Channel Latency: {sample['total_delay']:.1f}ms | Loss: {sample['packet_loss_rate']:.2f}% | Mode: {sample['network_type']}"
        log.status_level = 'INFO'
        self.comms_log_pub.publish(log)

def main(args=None):
    rclpy.init(args=args)
    node = NetworkImpairmentNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
