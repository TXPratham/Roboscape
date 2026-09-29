#!/usr/bin/env python3
"""
Fleet Communications Logger & Aggregator Node
Subscribes to P2P inter-robot topics:
- /fleet/intersection_reservations (IntersectionReservation.msg)
- /fleet/task_bids (TaskBid.msg)
- /fleet/blocked_aisles (BlockedAisle.msg)
- /fleet/safety_events (SafetyEvent.msg)
Aggregates and broadcasts formatted comms events onto /fleet/comms_log (CommsLog.msg)
for the Web Dashboard visualization feed.
"""

import rclpy
from rclpy.node import Node
from fleet_msgs.msg import CommsLog, IntersectionReservation, TaskBid, BlockedAisle

class FleetCommsLoggerNode(Node):
    def __init__(self):
        super().__init__('fleet_comms_logger_node')

        # Publisher for the unified fleet comms feed topic
        self.comms_log_pub = self.create_publisher(CommsLog, '/fleet/comms_log', 50)

        # 1. Subscribe to Intersection Reservations
        self.create_subscription(
            IntersectionReservation,
            '/fleet/intersection_reservations',
            self.handle_intersection_reservation,
            20
        )

        # 2. Subscribe to Task Bidding Auction Pool
        self.create_subscription(
            TaskBid,
            '/fleet/task_bids',
            self.handle_task_bid,
            20
        )

        # 3. Subscribe to Blocked Aisle Alerts
        self.create_subscription(
            BlockedAisle,
            '/fleet/blocked_aisles',
            self.handle_blocked_aisle,
            10
        )

        self.get_logger().info('Fleet Comms Logger Node initialized. Listening on P2P topics and broadcasting to /fleet/comms_log.')

    def handle_intersection_reservation(self, msg: IntersectionReservation):
        log_msg = CommsLog()
        log_msg.robot_id = msg.robot_id
        log_msg.msg_type = msg.request_type
        log_msg.topic_source = '/fleet/intersection_reservations'
        log_msg.timestamp = self.get_clock().now().to_msg()

        if msg.request_type == 'REQUEST':
            log_msg.content = f'REQUESTED Intersection {msg.intersection_id}'
            log_msg.status_level = 'WARNING'
        elif msg.request_type == 'GRANT':
            log_msg.content = f'GRANTED Intersection {msg.intersection_id}'
            log_msg.status_level = 'SUCCESS'
        elif msg.request_type == 'DENY':
            log_msg.content = f'DENIED Intersection {msg.intersection_id}'
            log_msg.status_level = 'ERROR'
        elif msg.request_type == 'RELEASE':
            log_msg.content = f'RELEASED Intersection {msg.intersection_id}'
            log_msg.status_level = 'INFO'
        else:
            log_msg.content = f'{msg.request_type} Intersection {msg.intersection_id}'
            log_msg.status_level = 'INFO'

        self.comms_log_pub.publish(log_msg)
        self.get_logger().info(f'[{log_msg.robot_id}] {log_msg.content}')

    def handle_task_bid(self, msg: TaskBid):
        log_msg = CommsLog()
        log_msg.robot_id = msg.robot_id
        log_msg.msg_type = 'BID'
        log_msg.topic_source = '/fleet/task_bids'
        log_msg.status_level = 'INFO'
        log_msg.timestamp = self.get_clock().now().to_msg()
        log_msg.content = f'BID ${msg.bid_amount:.2f} for Task {msg.task_id} (ETA {msg.eta_seconds:.1f}s)'

        self.comms_log_pub.publish(log_msg)
        self.get_logger().info(f'[{log_msg.robot_id}] {log_msg.content}')

    def handle_blocked_aisle(self, msg: BlockedAisle):
        log_msg = CommsLog()
        log_msg.robot_id = msg.reporter_id
        log_msg.msg_type = 'BLOCKED_AISLE'
        log_msg.topic_source = '/fleet/blocked_aisles'
        log_msg.status_level = 'ERROR' if msg.severity == 'CRITICAL' else 'WARNING'
        log_msg.timestamp = self.get_clock().now().to_msg()
        log_msg.content = f'BROADCAST Blocked Aisle {msg.aisle_id} ({msg.severity} at pos [{msg.position_x:.1f}, {msg.position_z:.1f}])'

        self.comms_log_pub.publish(log_msg)
        self.get_logger().warn(f'[{log_msg.robot_id}] {log_msg.content}')

def main(args=None):
    rclpy.init(args=args)
    node = FleetCommsLoggerNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
