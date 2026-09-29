#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, DurabilityPolicy, ReliabilityPolicy
import time
import math
from fleet_msgs.msg import IntersectionReservation, RobotPose

class ReservationNode(Node):
    def __init__(self):
        super().__init__('reservation_node')
        self.declare_parameter('robot_id', 'robot_1')
        self.robot_id = self.get_parameter('robot_id').get_parameter_value().string_value

        transient_qos = QoSProfile(
            depth=20,
            durability=DurabilityPolicy.TRANSIENT_LOCAL,
            reliability=ReliabilityPolicy.RELIABLE
        )

        self.res_pub = self.create_publisher(IntersectionReservation, '/fleet/intersections/reservations', transient_qos)
        self.res_sub = self.create_subscription(
            IntersectionReservation, '/fleet/intersections/reservations', self.reservation_cb, transient_qos
        )

        self.my_pose = {'x': 0.0, 'y': 0.0}
        self.pose_sub = self.create_subscription(
            RobotPose, f'/{self.robot_id}/fleet/pose', self.pose_cb, 10
        )

        self.current_reservations = {} # intersection_id -> holder_robot_id
        self.pending_requests = {}
        self.held_intersection = None

        self.timer = self.create_timer(0.2, self.check_zone_proximity)
        self.get_logger().info(f'ReservationNode active for [{self.robot_id}]')

    def pose_cb(self, msg: RobotPose):
        self.my_pose['x'] = msg.x
        self.my_pose['y'] = msg.y

    def reservation_cb(self, msg: IntersectionReservation):
        if msg.request_type == 'GRANT':
            self.current_reservations[msg.intersection_id] = msg.robot_id
        elif msg.request_type == 'RELEASE':
            if self.current_reservations.get(msg.intersection_id) == msg.robot_id:
                del self.current_reservations[msg.intersection_id]
        elif msg.request_type == 'REQUEST':
            # Check if we should grant or deny
            holder = self.current_reservations.get(msg.intersection_id)
            if holder is None or holder == msg.robot_id:
                grant_msg = IntersectionReservation()
                grant_msg.robot_id = msg.robot_id
                grant_msg.intersection_id = msg.intersection_id
                grant_msg.request_type = 'GRANT'
                grant_msg.timestamp = time.time()
                self.res_pub.publish(grant_msg)

    def request_intersection(self, iid):
        req = IntersectionReservation()
        req.robot_id = self.robot_id
        req.intersection_id = iid
        req.request_type = 'REQUEST'
        req.timestamp = time.time()
        self.res_pub.publish(req)
        self.get_logger().info(f'[{self.robot_id}] Broadcasted REQUEST for {iid}')

    def release_intersection(self, iid):
        rel = IntersectionReservation()
        rel.robot_id = self.robot_id
        rel.intersection_id = iid
        rel.request_type = 'RELEASE'
        rel.timestamp = time.time()
        self.res_pub.publish(rel)
        if self.held_intersection == iid:
            self.held_intersection = None
        self.get_logger().info(f'[{self.robot_id}] Broadcasted RELEASE for {iid}')

    def check_zone_proximity(self):
        # Demo intersections: INT_CENTER (0,0)
        dist_to_center = math.hypot(self.my_pose['x'] - 0.0, self.my_pose['y'] - 0.0)
        if dist_to_center < 2.0 and not self.held_intersection:
            self.request_intersection('INT_CENTER')
            self.held_intersection = 'INT_CENTER'
        elif dist_to_center >= 2.5 and self.held_intersection == 'INT_CENTER':
            self.release_intersection('INT_CENTER')

def main(args=None):
    rclpy.init(args=args)
    node = ReservationNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
