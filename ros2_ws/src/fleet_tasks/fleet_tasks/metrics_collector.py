#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from fleet_msgs.msg import TaskAnnouncement
import json
import time

class MetricsCollector(Node):
    def __init__(self):
        super().__init__('metrics_collector')
        self.metrics_pub = self.create_publisher(String, '/fleet/task_metrics', 10)
        
        self.create_subscription(TaskAnnouncement, '/fleet/task_requests', self.request_cb, 10)
        self.create_subscription(String, '/fleet/task_awards', self.award_cb, 10)

        self.tasks_logged = {}
        self.completed_count = 0
        self.total_assigned = 0

        # 1 Hz metrics broadcast
        self.timer = self.create_timer(1.0, self.publish_summary)
        self.get_logger().info('MetricsCollector started, monitoring task allocations.')

    def request_cb(self, msg: TaskAnnouncement):
        self.tasks_logged[msg.task_id] = {
            'created_at': time.time(),
            'assigned_to': None,
            'cost': None,
            'retry_count': 0
        }

    def award_cb(self, msg: String):
        data = msg.data.split(':')
        if len(data) >= 4 and data[0] == 'AWARD':
            tid, robot, cost = data[1], data[2], float(data[3])
            if tid in self.tasks_logged:
                self.tasks_logged[tid]['assigned_to'] = robot
                self.tasks_logged[tid]['cost'] = cost
                self.tasks_logged[tid]['assigned_at'] = time.time()
                self.total_assigned += 1

    def publish_summary(self):
        summary = {
            'total_requests': len(self.tasks_logged),
            'total_assigned': self.total_assigned,
            'active_tasks': sum(1 for t in self.tasks_logged.values() if t['assigned_to'] is not None),
            'timestamp': time.time()
        }
        msg = String()
        msg.data = json.dumps(summary)
        self.metrics_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = MetricsCollector()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
