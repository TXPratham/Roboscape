#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from fleet_msgs.msg import TaskAnnouncement, TaskBid, RobotPose, BatteryStatus
import math
import time

class BidderNode(Node):
    def __init__(self):
        super().__init__('bidder_node')
        self.declare_parameter('robot_id', 'robot_1')
        self.robot_id = self.get_parameter('robot_id').get_parameter_value().string_value

        self.my_pose = {'x': 0.0, 'y': 0.0}
        self.battery_pct = 95.0
        self.other_poses = {}

        # 6G network QoS baseline for this robot (latency ms, energy consumption units)
        self.network_latency = 12.5 # ms
        self.energy_rate = 1.2 # Joules/step

        self.bid_pub = self.create_publisher(TaskBid, '/fleet/task_bids', 10)

        self.create_subscription(TaskAnnouncement, '/fleet/task_announcements', self.announcement_cb, 10)
        self.create_subscription(String, '/fleet/task_awards', self.award_cb, 10)
        self.create_subscription(RobotPose, f'/{self.robot_id}/fleet/pose', self.pose_cb, 10)
        self.create_subscription(BatteryStatus, f'/{self.robot_id}/fleet/battery', self.battery_cb, 10)

        # Track peer positions for congestion penalty
        for rid in ['robot_1', 'robot_2', 'robot_3']:
            if rid != self.robot_id:
                self.create_subscription(
                    RobotPose, f'/{rid}/fleet/pose',
                    lambda msg, r=rid: self.peer_pose_cb(r, msg), 10
                )

        self.get_logger().info(f'BidderNode initialized for [{self.robot_id}].')

    def pose_cb(self, msg: RobotPose):
        self.my_pose['x'] = msg.x
        self.my_pose['y'] = msg.y

    def battery_cb(self, msg: BatteryStatus):
        self.battery_pct = msg.percentage

    def peer_pose_cb(self, rid, msg: RobotPose):
        self.other_poses[rid] = (msg.x, msg.y)

    def announcement_cb(self, msg: TaskAnnouncement):
        # Battery safeguard: if below 15%, do not bid
        if self.battery_pct < 15.0:
            self.get_logger().warn(f'[{self.robot_id}] Battery {self.battery_pct:.1f}% < 15%; abstaining from bidding on {msg.task_id}')
            return

        # 1. Spatial distance to pickup and dropoff
        dist_pickup = math.hypot(msg.pickup_x - self.my_pose['x'], msg.pickup_y - self.my_pose['y'])
        dist_dropoff = math.hypot(msg.dropoff_x - msg.pickup_x, msg.dropoff_y - msg.pickup_y)
        spatial_cost = 0.50 * (dist_pickup + dist_dropoff)

        # 2. Battery penalty
        battery_penalty = max(0.0, (20.0 - self.battery_pct)) * 10.0

        # 3. Congestion penalty (robots within 5m of pickup)
        robots_near_pickup = sum(
            1 for pos in self.other_poses.values()
            if math.hypot(pos[0] - msg.pickup_x, pos[1] - msg.pickup_y) < 5.0
        )
        congestion_penalty = robots_near_pickup * 5.0

        # 4. 6G Network QoS and Energy penalty
        network_cost = 0.25 * self.network_latency
        energy_cost = 0.35 * (self.energy_rate * 10.0)

        total_cost = spatial_cost + battery_penalty + congestion_penalty + network_cost + energy_cost

        bid = TaskBid()
        bid.task_id = msg.task_id
        bid.robot_id = self.robot_id
        bid.cost = float(total_cost)
        bid.timestamp = time.time()
        self.bid_pub.publish(bid)
        self.get_logger().info(f'[{self.robot_id}] Submitted bid for {msg.task_id}: ${total_cost:.2f}')

    def award_cb(self, msg: String):
        data = msg.data.split(':')
        if len(data) >= 3 and data[0] == 'AWARD':
            tid, winner = data[1], data[2]
            if winner == self.robot_id:
                self.get_logger().info(f'🎉 [{self.robot_id}] WON CONTRACT for {tid}! Proceeding to pickup.')

def main(args=None):
    rclpy.init(args=args)
    node = BidderNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
