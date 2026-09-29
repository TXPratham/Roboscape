#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from std_msgs.msg import String
from fleet_msgs.msg import RobotPose
import math
import time

class EmergencyStop(Node):
    def __init__(self):
        super().__init__('emergency_stop')
        self.min_safe_distance = 0.35  # meters
        self.robot_poses = {} # robot_id -> {'x': float, 'y': float, 'timestamp': float}

        self.cmd_vel_pubs = {
            'robot_1': self.create_publisher(Twist, '/robot_1/cmd_vel', 10),
            'robot_2': self.create_publisher(Twist, '/robot_2/cmd_vel', 10),
            'robot_3': self.create_publisher(Twist, '/robot_3/cmd_vel', 10),
        }

        self.safety_events_pub = self.create_publisher(String, '/fleet/safety_events', 10)

        # Subscribe to all poses
        for rid in ['robot_1', 'robot_2', 'robot_3']:
            self.create_subscription(
                RobotPose, f'/{rid}/fleet/pose',
                lambda msg, r=rid: self.pose_callback(r, msg), 10
            )

        # Deterministic 50 Hz safety check loop
        self.timer = self.create_timer(0.02, self.safety_check_loop)
        self.get_logger().info(f'Deterministic EmergencyStop layer running at 50 Hz (min_safe_dist={self.min_safe_distance}m)')

    def pose_callback(self, rid, msg: RobotPose):
        self.robot_poses[rid] = {
            'x': msg.x,
            'y': msg.y,
            'timestamp': time.time()
        }

    def safety_check_loop(self):
        rids = list(self.robot_poses.keys())
        for i in range(len(rids)):
            for j in range(i + 1, len(rids)):
                r1 = rids[i]
                r2 = rids[j]
                p1 = self.robot_poses[r1]
                p2 = self.robot_poses[r2]

                dist = math.hypot(p1['x'] - p2['x'], p1['y'] - p2['y'])
                if dist < self.min_safe_distance:
                    # Determine priority: lower string ID has priority (r_priority halts, r_yield reverses)
                    r_priority = min(r1, r2)
                    r_yield = max(r1, r2)

                    # Priority robot halts in place
                    stop_twist = Twist()
                    stop_twist.linear.x = 0.0
                    stop_twist.angular.z = 0.0
                    if r_priority in self.cmd_vel_pubs:
                        self.cmd_vel_pubs[r_priority].publish(stop_twist)

                    # Yielding robot actively reverses to clear the collision zone!
                    reverse_twist = Twist()
                    reverse_twist.linear.x = -0.32
                    reverse_twist.angular.z = 0.0
                    if r_yield in self.cmd_vel_pubs:
                        self.cmd_vel_pubs[r_yield].publish(reverse_twist)

                    warn_msg = f'COLLISION RESOLUTION: {r_yield} actively REVERSING away from {r_priority} (dist={dist:.3f}m < {self.min_safe_distance}m) to reroute and clear route.'
                    self.get_logger().warn(warn_msg)
                    
                    event = String()
                    event.data = warn_msg
                    self.safety_events_pub.publish(event)

def main(args=None):
    rclpy.init(args=args)
    node = EmergencyStop()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
