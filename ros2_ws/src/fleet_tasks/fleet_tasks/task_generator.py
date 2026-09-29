#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import yaml
import os
import time
from ament_index_python.packages import get_package_share_directory
from fleet_msgs.msg import TaskAnnouncement

class TaskGenerator(Node):
    def __init__(self):
        super().__init__('task_generator')
        self.task_pub = self.create_publisher(TaskAnnouncement, '/fleet/task_requests', 10)

        # Load predefined warehouse tasks
        try:
            pkg_share = get_package_share_directory('fleet_tasks')
            config_file = os.path.join(pkg_share, 'config', 'tasks.yaml')
        except Exception:
            config_file = '/home/txpratham/sih2026/ros2_ws/src/fleet_tasks/config/tasks.yaml'

        self.tasks = []
        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                data = yaml.safe_load(f)
                self.tasks = data.get('tasks', [])

        self.task_idx = 0
        # Trigger task release every 8 seconds
        self.timer = self.create_timer(8.0, self.release_next_task)
        self.get_logger().info(f'TaskGenerator started with {len(self.tasks)} warehouse logistics tasks.')

    def release_next_task(self):
        if not self.tasks:
            return

        task_def = self.tasks[self.task_idx % len(self.tasks)]
        self.task_idx += 1

        msg = TaskAnnouncement()
        msg.task_id = f"{task_def['task_id']}_{int(time.time()) % 1000}"
        msg.pickup_x = float(task_def['pickup'][0])
        msg.pickup_y = float(task_def['pickup'][1])
        msg.dropoff_x = float(task_def['dropoff'][0])
        msg.dropoff_y = float(task_def['dropoff'][1])
        msg.priority = int(task_def.get('priority', 1))
        msg.timestamp = time.time()

        self.task_pub.publish(msg)
        self.get_logger().info(f'Generated new logistics request: {msg.task_id} -> pickup ({msg.pickup_x}, {msg.pickup_y})')

def main(args=None):
    rclpy.init(args=args)
    node = TaskGenerator()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
