#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class RobotSpawner(Node):
    def __init__(self):
        super().__init__('robot_spawner')
        self.declare_parameter('robot_id', 'robot_1')
        self.robot_id = self.get_parameter('robot_id').get_parameter_value().string_value
        self.status_pub = self.create_publisher(String, 'spawn_status', 10)
        self.timer = self.create_timer(1.0, self.timer_cb)
        self.get_logger().info(f'Robot [{self.robot_id}] spawned successfully.')

    def timer_cb(self):
        msg = String()
        msg.data = f'{self.robot_id}: ACTIVE_OK'
        self.status_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = RobotSpawner()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
