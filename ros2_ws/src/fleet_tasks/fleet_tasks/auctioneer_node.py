#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from fleet_msgs.msg import TaskAnnouncement, TaskBid
import time

class AuctioneerNode(Node):
    def __init__(self):
        super().__init__('auctioneer_node')
        self.bidding_window_sec = 0.50 # 500 ms
        self.current_auctions = {} # task_id -> {'announcement': ..., 'deadline': ..., 'bids': []}

        self.announcement_pub = self.create_publisher(TaskAnnouncement, '/fleet/task_announcements', 10)
        self.award_pub = self.create_publisher(String, '/fleet/task_awards', 10)
        
        self.create_subscription(TaskAnnouncement, '/fleet/task_requests', self.task_request_cb, 10)
        self.create_subscription(TaskBid, '/fleet/task_bids', self.task_bid_cb, 10)

        # 20 Hz timer to close auctions
        self.timer = self.create_timer(0.05, self.evaluate_auctions)
        self.get_logger().info('AuctioneerNode started with 500ms bidding window.')

    def task_request_cb(self, msg: TaskAnnouncement):
        self.get_logger().info(f'Auction opened for {msg.task_id} (Priority {msg.priority})')
        now = time.time()
        self.current_auctions[msg.task_id] = {
            'announcement': msg,
            'deadline': now + self.bidding_window_sec,
            'bids': []
        }
        self.announcement_pub.publish(msg)

    def task_bid_cb(self, msg: TaskBid):
        if msg.task_id in self.current_auctions:
            self.current_auctions[msg.task_id]['bids'].append(msg)
            self.get_logger().debug(f'Received bid from {msg.robot_id} for {msg.task_id}: cost={msg.cost:.2f}')

    def evaluate_auctions(self):
        now = time.time()
        completed = []
        for tid, data in self.current_auctions.items():
            if now >= data['deadline']:
                bids = data['bids']
                if bids:
                    # Select lowest cost
                    best_bid = min(bids, key=lambda b: b.cost)
                    ann = data['announcement']
                    award_str = f'AWARD:{tid}:{best_bid.robot_id}:{best_bid.cost:.2f}:{ann.pickup_x:.2f}:{ann.pickup_y:.2f}:{ann.dropoff_x:.2f}:{ann.dropoff_y:.2f}'
                    self.get_logger().info(f'Auction WON: {tid} awarded to [{best_bid.robot_id}] with cost {best_bid.cost:.2f}')
                    
                    award_msg = String()
                    award_msg.data = award_str
                    self.award_pub.publish(award_msg)
                else:
                    self.get_logger().warn(f'No bids received for {tid}; releasing for retry.')
                    # Re-announce with delay
                    retry_ann = data['announcement']
                    retry_ann.timestamp = now
                    self.announcement_pub.publish(retry_ann)
                completed.append(tid)

        for tid in completed:
            del self.current_auctions[tid]

def main(args=None):
    rclpy.init(args=args)
    node = AuctioneerNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
