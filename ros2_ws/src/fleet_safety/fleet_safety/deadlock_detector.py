#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from fleet_msgs.msg import IntersectionReservation
import time

class DeadlockDetector(Node):
    def __init__(self):
        super().__init__('deadlock_detector')
        self.wait_for_graph = {} # robot_id -> waiting_for_robot_id
        self.safety_events_pub = self.create_publisher(String, '/fleet/safety_events', 10)
        
        self.create_subscription(
            IntersectionReservation, '/fleet/intersections/reservations', self.reservation_cb, 10
        )

        self.last_claim = {}
        # Cycle detection every 100 ms (10 Hz)
        self.timer = self.create_timer(0.10, self.detect_cycles)
        self.get_logger().info('DeadlockDetector initialized (100 ms wait-for-graph cycle detection).')

    def reservation_cb(self, msg: IntersectionReservation):
        if msg.request_type == 'GRANT':
            self.last_claim[msg.intersection_id] = msg.robot_id
        elif msg.request_type == 'RELEASE':
            if self.last_claim.get(msg.intersection_id) == msg.robot_id:
                del self.last_claim[msg.intersection_id]
        elif msg.request_type == 'REQUEST':
            holder = self.last_claim.get(msg.intersection_id)
            if holder and holder != msg.robot_id:
                self.wait_for_graph[msg.robot_id] = holder
            elif msg.robot_id in self.wait_for_graph:
                del self.wait_for_graph[msg.robot_id]

    def detect_cycles(self):
        # Directed graph cycle detection (Tarjan or simple visited/rec_stack)
        visited = set()
        rec_stack = set()
        cycles = []

        def dfs(node, path):
            visited.add(node)
            rec_stack.add(node)
            path.append(node)

            neighbor = self.wait_for_graph.get(node)
            if neighbor:
                if neighbor not in visited:
                    dfs(neighbor, path)
                elif neighbor in rec_stack:
                    idx = path.index(neighbor)
                    cycles.append(path[idx:])

            rec_stack.remove(node)
            path.pop()

        for node in list(self.wait_for_graph.keys()):
            if node not in visited:
                dfs(node, [])

        if cycles:
            cycle = cycles[0]
            self.get_logger().warn(f'DEADLOCK DETECTED in wait-for graph: {" -> ".join(cycle)}')
            
            # Resolve: lowest priority robot (e.g. robot with lexicographically highest ID) backs off
            victim = sorted(cycle, reverse=True)[0]
            
            event_msg = String()
            event_msg.data = f'DEADLOCK_CYCLE: {cycle} | RESOLUTION: Robot [{victim}] ordered to BACK OFF'
            self.safety_events_pub.publish(event_msg)

            # Clear edge to break cycle
            if victim in self.wait_for_graph:
                del self.wait_for_graph[victim]

def main(args=None):
    rclpy.init(args=args)
    node = DeadlockDetector()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
