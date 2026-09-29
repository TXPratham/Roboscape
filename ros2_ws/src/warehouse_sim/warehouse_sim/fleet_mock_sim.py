#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import math
import time
import os
import yaml
import json
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from sensor_msgs.msg import LaserScan
from std_msgs.msg import String
from fleet_msgs.msg import RobotPose, BatteryStatus, TaskAnnouncement

class FleetMockSim(Node):
    def __init__(self):
        super().__init__('fleet_mock_sim')

        # Strict Red Line highway corridors: Left Highway (-13.0m) and Right Highway (13.0m) ONLY
        self.corridors_x = [-13.0, 13.0]
        self.aisles_y = [-8.0, -5.0, -1.5, 2.0, 5.5]

        # Initial AMR fleet state in open AMR Zone (y = 5.5m)
        self.robots = {
            'robot_1': {
                'x': -7.0, 'y': 5.5, 'yaw': 0.0, 'vx': 0.0, 'wz': 0.0,
                'target_speed': 0.9, 'battery': 98.4, 'voltage': 25.2,
                'status': 'IDLE', 'current_task': None, 'waypoints': [], 'wp_idx': 0,
                'pause_timer': 0.0, 'manual_cmd': False,
                'avoidance_mode': 'NORMAL', 'reverse_timer': 0.0, 'reroute_highway': None
            },
            'robot_2': {
                'x': 0.0, 'y': 5.5, 'yaw': 0.0, 'vx': 0.0, 'wz': 0.0,
                'target_speed': 0.75, 'battery': 94.2, 'voltage': 24.8,
                'status': 'IDLE', 'current_task': None, 'waypoints': [], 'wp_idx': 0,
                'pause_timer': 0.0, 'manual_cmd': False,
                'avoidance_mode': 'NORMAL', 'reverse_timer': 0.0, 'reroute_highway': None
            },
            'robot_3': {
                'x': 7.0, 'y': 5.5, 'yaw': 0.0, 'vx': 0.0, 'wz': 0.0,
                'target_speed': 0.9, 'battery': 96.8, 'voltage': 24.5,
                'status': 'IDLE', 'current_task': None, 'waypoints': [], 'wp_idx': 0,
                'pause_timer': 0.0, 'manual_cmd': False,
                'avoidance_mode': 'NORMAL', 'reverse_timer': 0.0, 'reroute_highway': None
            }
        }

        # Load predefined warehouse tasks
        self.task_queue = []
        self.load_tasks()

        self.cmd_subs = {}
        self.pose_pubs = {}
        self.odom_pubs = {}
        self.scan_pubs = {}
        self.batt_pubs = {}

        for rid in self.robots.keys():
            self.cmd_subs[rid] = self.create_subscription(
                Twist, f'/{rid}/cmd_vel',
                lambda msg, r=rid: self.cmd_vel_callback(r, msg), 10
            )
            self.pose_pubs[rid] = self.create_publisher(RobotPose, f'/{rid}/fleet/pose', 10)
            self.odom_pubs[rid] = self.create_publisher(Odometry, f'/{rid}/odom', 10)
            self.scan_pubs[rid] = self.create_publisher(LaserScan, f'/{rid}/scan', 10)
            self.batt_pubs[rid] = self.create_publisher(BatteryStatus, f'/{rid}/fleet/battery', 10)

        self.award_sub = self.create_subscription(
            String, '/fleet/task_awards', self.award_callback, 10
        )
        self.task_req_sub = self.create_subscription(
            TaskAnnouncement, '/fleet/task_requests', self.task_request_callback, 10
        )
        # Dedicated topics for manual operator control and manual task assignment
        self.manual_task_sub = self.create_subscription(
            String, '/fleet/manual_task_assignment', self.manual_task_callback, 10
        )
        self.manual_mode_sub = self.create_subscription(
            String, '/fleet/manual_control_mode', self.manual_mode_callback, 10
        )
        self.safety_pub = self.create_publisher(String, '/fleet/safety_events', 10)

        # 20 Hz simulation physics loop
        self.timer = self.create_timer(0.05, self.update_physics)
        self.get_logger().info('Fleet mock simulator started with autonomous warehouse navigation and reverse-reroute collision avoidance.')

    def load_tasks(self):
        config_path = '/home/txpratham/sih2026/ros2_ws/src/fleet_tasks/config/tasks.yaml'
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    data = yaml.safe_load(f)
                    self.task_queue = data.get('tasks', [])
            except Exception as e:
                self.get_logger().warn(f'Could not load tasks.yaml: {e}')

    def get_nearest_aisle_y(self, y):
        return min(self.aisles_y, key=lambda ay: abs(y - ay))

    def get_nearest_corridor_x(self, x):
        return min(self.corridors_x, key=lambda cx: abs(x - cx))

    def plan_grid_path(self, start_x, start_y, raw_target_x, raw_target_y, preferred_highway=None):
        """
        Strict Red Line Highway Path Planner.
        The ONLY permitted routes are:
        - 5 Horizontal Aisles: Y in [-8.0, -5.0, -1.5, 2.0, 5.5]
        - Vertical Highways: Left Highway (X = -13.0) and Right Highway (X = 13.0) ONLY
        - Docking spurs: from South Aisle (Y = 5.5) straight to Dock (Y = 6.9)
        """
        HIGHWAY_LEFT_X = -13.0
        HIGHWAY_RIGHT_X = 13.0
        SOUTH_AISLE_Y = 5.5
        DOCK_Y = 6.9

        # 1. Start location resolution
        is_start_at_dock = start_y > 5.8
        start_aisle = SOUTH_AISLE_Y if is_start_at_dock else self.get_nearest_aisle_y(start_y)

        # 2. Destination resolution
        is_target_dock = raw_target_y > 6.0
        target_x = raw_target_x
        target_aisle = SOUTH_AISLE_Y if is_target_dock else self.get_nearest_aisle_y(raw_target_y)

        waypoints = []

        # Step A: If starting at delivery bay dock, step straight up to South Aisle (Y = 5.5)
        if is_start_at_dock:
            waypoints.append((start_x, SOUTH_AISLE_Y))
        elif abs(start_y - start_aisle) > 0.15:
            waypoints.append((start_x, start_aisle))

        # Step B: Route across aisles
        if abs(start_aisle - target_aisle) < 0.1 and preferred_highway is None:
            # SAME AISLE: Direct straight movement along the red aisle line
            if abs(start_x - target_x) > 0.15:
                waypoints.append((target_x, target_aisle))
        else:
            # DIFFERENT AISLE or FORCED HIGHWAY REROUTE:
            if preferred_highway is not None:
                chosen_highway = float(preferred_highway)
            else:
                cost_left = abs(start_x - HIGHWAY_LEFT_X) + abs(start_aisle - target_aisle) + abs(target_x - HIGHWAY_LEFT_X)
                cost_right = abs(start_x - HIGHWAY_RIGHT_X) + abs(start_aisle - target_aisle) + abs(target_x - HIGHWAY_RIGHT_X)
                chosen_highway = HIGHWAY_LEFT_X if cost_left <= cost_right else HIGHWAY_RIGHT_X

            # 1. Travel horizontally along start aisle to chosen highway
            waypoints.append((chosen_highway, start_aisle))

            # 2. Travel vertically along chosen highway to destination aisle
            waypoints.append((chosen_highway, target_aisle))

            # 3. Travel horizontally along destination aisle to target X
            waypoints.append((target_x, target_aisle))

        # Step C: If destination is delivery dock, step down straight spur to dock (Y = 6.9)
        if is_target_dock:
            waypoints.append((target_x, DOCK_Y))

        return waypoints if waypoints else [(target_x, target_aisle)]

    def award_callback(self, msg: String):
        parts = msg.data.split(':')
        if len(parts) >= 8 and parts[0] == 'AWARD':
            tid, winner = parts[1], parts[2]
            px, py, dx, dy = float(parts[4]), float(parts[5]), float(parts[6]), float(parts[7])
            if winner in self.robots:
                self.assign_task(winner, tid, px, py, dx, dy)

    def task_request_callback(self, msg: TaskAnnouncement):
        for rid, state in self.robots.items():
            if state['status'] == 'IDLE':
                self.assign_task(rid, msg.task_id, msg.pickup_x, msg.pickup_y, msg.dropoff_x, msg.dropoff_y)
                break

    def manual_task_callback(self, msg: String):
        try:
            data = json.loads(msg.data)
            rid = data.get('robot_id')
            task_id = data.get('task_id', f'MANUAL-{int(time.time())%10000}')
            px = float(data.get('pickup_x', -7.0))
            py = float(data.get('pickup_y', -1.5))
            dx = float(data.get('dropoff_x', 3.5))
            dy = float(data.get('dropoff_y', 6.9))
            if rid in self.robots:
                self.assign_task(rid, task_id, px, py, dx, dy)
                self.get_logger().info(f'[MANUAL DISPATCH] Task {task_id} assigned directly to {rid}')
            else:
                for candidate_id, state in self.robots.items():
                    if state['status'] == 'IDLE':
                        self.assign_task(candidate_id, task_id, px, py, dx, dy)
                        break
        except Exception as e:
            self.get_logger().error(f'Error processing manual task: {e}')

    def manual_mode_callback(self, msg: String):
        try:
            data = json.loads(msg.data)
            rid = data.get('robot_id')
            enabled = bool(data.get('enabled', False))
            if rid in self.robots:
                self.robots[rid]['manual_cmd'] = enabled
                if not enabled:
                    self.robots[rid]['vx'] = 0.0
                    self.robots[rid]['wz'] = 0.0
                    self.get_logger().info(f'[{rid}] Manual control released. Resumed autonomous route.')
                else:
                    self.get_logger().info(f'[{rid}] Manual teleop override active.')
        except Exception as e:
            self.get_logger().error(f'Error processing manual mode: {e}')

    def assign_task(self, rid, task_id, px, py, dx, dy):
        robot = self.robots[rid]
        robot['manual_cmd'] = False
        robot['avoidance_mode'] = 'NORMAL'
        robot['estop_timer'] = 0.0
        robot['current_task'] = {
            'task_id': task_id,
            'pickup': (px, py),
            'dropoff': (dx, dy)
        }
        robot['status'] = 'EN_ROUTE_PICKUP'
        robot['waypoints'] = self.plan_grid_path(robot['x'], robot['y'], px, py)
        robot['wp_idx'] = 0
        robot['pause_timer'] = 0.0
        self.get_logger().info(f'[{rid}] Assigned {task_id}: en route to pickup ({px:.2f}, {py:.2f})')

    def cmd_vel_callback(self, rid, msg: Twist):
        # Allow negative linear.x for active reversing
        if abs(msg.linear.x) < 0.001 and abs(msg.angular.z) < 0.001 and not self.robots[rid]['manual_cmd']:
            self.robots[rid]['vx'] = 0.0
            self.robots[rid]['wz'] = 0.0
            self.robots[rid]['estop_timer'] = 0.25
        else:
            self.robots[rid]['vx'] = msg.linear.x
            self.robots[rid]['wz'] = msg.angular.z

    def update_physics(self):
        dt = 0.05
        now = time.time()

        # Check for idle robots and dispatch queued tasks
        for rid, state in self.robots.items():
            if state['status'] == 'IDLE' and self.task_queue and not state['manual_cmd']:
                task = self.task_queue.pop(0)
                px, py = task['pickup']
                dx, dy = task['dropoff']
                self.assign_task(rid, task['task_id'], px, py, dx, dy)
                self.task_queue.append(task) # cycle tasks

        # --- Multi-AMR Conflict Resolution: Reverse & Reroute ---
        for rid, state in self.robots.items():
            if state['manual_cmd']:
                continue

            # 1. If robot is currently in REVERSING avoidance maneuver
            if state.get('avoidance_mode') == 'REVERSING':
                state['reverse_timer'] -= dt
                state['vx'] = -0.32  # Back up safely
                state['wz'] = 0.0

                min_sep = 999.0
                for oid, ost in self.robots.items():
                    if oid != rid:
                        min_sep = min(min_sep, math.hypot(ost['x'] - state['x'], ost['y'] - state['y']))

                if state['reverse_timer'] <= 0.0 or min_sep > 1.35:
                    # Clearance restored! Trigger Reroute
                    state['avoidance_mode'] = 'NORMAL'
                    state['reverse_timer'] = 0.0
                    state['vx'] = 0.0

                    dest_x, dest_y = None, None
                    if state['status'] == 'EN_ROUTE_PICKUP' and state.get('current_task'):
                        dest_x, dest_y = state['current_task']['pickup']
                    elif state['status'] == 'EN_ROUTE_DELIVERY' and state.get('current_task'):
                        dest_x, dest_y = state['current_task']['dropoff']
                    elif state['waypoints'] and state['wp_idx'] < len(state['waypoints']):
                        dest_x, dest_y = state['waypoints'][-1]

                    if dest_x is not None:
                        alt_hw = state.get('reroute_highway', 13.0)
                        state['waypoints'] = self.plan_grid_path(state['x'], state['y'], dest_x, dest_y, preferred_highway=alt_hw)
                        state['wp_idx'] = 0
                        self.get_logger().info(f'[{rid}] Safe clearance restored. REROUTED via Highway X={alt_hw}m.')

                        event_msg = String()
                        event_msg.data = f'[COLLISION-RESOLVED] {rid} completed reverse. Rerouted via Highway X={alt_hw}m'
                        self.safety_pub.publish(event_msg)
                continue

            # 2. Check proactive conflict with other AMRs
            for oid, ost in self.robots.items():
                if oid == rid:
                    continue
                sep = math.hypot(ost['x'] - state['x'], ost['y'] - state['y'])
                if sep < 1.15:
                    # Determine right of way
                    has_prio = False
                    if state['manual_cmd'] and not ost['manual_cmd']:
                        has_prio = True
                    elif not state['manual_cmd'] and ost['manual_cmd']:
                        has_prio = False
                    else:
                        has_prio = (rid < oid)

                    if not has_prio:
                        # Yielding robot: engage REVERSING and plan alternate highway
                        state['avoidance_mode'] = 'REVERSING'
                        state['reverse_timer'] = 2.2
                        state['reroute_highway'] = 13.0 if state['x'] <= 0.0 else -13.0
                        self.get_logger().warn(f'[{rid}] Proximity conflict with {oid} ({sep:.2f}m). TAKING REVERSE and REROUTING via Highway X={state["reroute_highway"]}m')

                        event_msg = String()
                        event_msg.data = f'[COLLISION-AVOIDANCE] {rid} taking REVERSE to yield to {oid} ({sep:.2f}m) and REROUTING via Highway X={state["reroute_highway"]}m'
                        self.safety_pub.publish(event_msg)
                        break
                    else:
                        # Priority robot: pause smoothly to allow peer to reverse
                        state['vx'] = 0.0
                        state['wz'] = 0.0
                        break

        for rid, state in self.robots.items():
            # If under emergency stop, hold position
            if state.get('estop_timer', 0) > 0 and state.get('avoidance_mode') != 'REVERSING':
                state['estop_timer'] -= dt
                state['vx'] = 0.0
                state['wz'] = 0.0
                continue

            # If not manual override, drive autonomously towards waypoints
            if not state['manual_cmd'] and state.get('avoidance_mode') != 'REVERSING':
                if state['pause_timer'] > 0:
                    state['pause_timer'] -= dt
                    state['vx'] = 0.0
                    state['wz'] = 0.0
                    if state['pause_timer'] <= 0:
                        if state['status'] == 'PICKING':
                            state['status'] = 'EN_ROUTE_DELIVERY'
                            dx, dy = state['current_task']['dropoff']
                            state['waypoints'] = self.plan_grid_path(state['x'], state['y'], dx, dy)
                            state['wp_idx'] = 0
                            self.get_logger().info(f'[{rid}] Pickup complete. En route to delivery dock ({dx:.2f}, {dy:.2f})')
                        elif state['status'] == 'DELIVERING':
                            state['status'] = 'IDLE'
                            state['current_task'] = None
                            state['waypoints'] = []
                            self.get_logger().info(f'[{rid}] Delivery complete at dock. Resuming IDLE.')

                elif state['waypoints'] and state['wp_idx'] < len(state['waypoints']):
                    tx, ty = state['waypoints'][state['wp_idx']]
                    dx = tx - state['x']
                    dy = ty - state['y']
                    dist = math.hypot(dx, dy)

                    if dist < 0.30:
                        state['wp_idx'] += 1
                        if state['wp_idx'] >= len(state['waypoints']):
                            # Reached destination leg
                            state['vx'] = 0.0
                            state['wz'] = 0.0
                            if state['status'] == 'EN_ROUTE_PICKUP':
                                state['status'] = 'PICKING'
                                state['pause_timer'] = 2.0
                                self.get_logger().info(f'[{rid}] Arrived at shelf pickup. Lifting payload...')
                            elif state['status'] == 'EN_ROUTE_DELIVERY':
                                state['status'] = 'DELIVERING'
                                state['pause_timer'] = 2.0
                                self.get_logger().info(f'[{rid}] Arrived at delivery bay dock. Unloading onto conveyor...')
                    else:
                        target_yaw = math.atan2(dy, dx)
                        angle_diff = target_yaw - state['yaw']
                        while angle_diff > math.pi: angle_diff -= 2 * math.pi
                        while angle_diff < -math.pi: angle_diff += 2 * math.pi

                        # Proximity speed scaling against other AMRs (local collision avoidance)
                        speed_mult = 1.0
                        for other_id, other_state in self.robots.items():
                            if other_id == rid: continue
                            sep = math.hypot(other_state['x'] - state['x'], other_state['y'] - state['y'])
                            if sep < 1.4:
                                if other_id < rid:
                                    speed_mult = 0.2
                                elif sep < 0.7:
                                    speed_mult = 0.0

                        if abs(angle_diff) > 0.20:
                            # Turn in place cleanly without position drift
                            state['wz'] = math.copysign(min(2.2, max(0.8, abs(angle_diff) * 3.0)), angle_diff)
                            state['vx'] = 0.0
                        else:
                            state['yaw'] = target_yaw
                            state['wz'] = 0.0
                            state['vx'] = state['target_speed'] * speed_mult

            # Kinematic integration
            state['yaw'] += state['wz'] * dt
            # Normalize yaw
            state['yaw'] = (state['yaw'] + math.pi) % (2 * math.pi) - math.pi
            state['x'] += state['vx'] * math.cos(state['yaw']) * dt
            state['y'] += state['vx'] * math.sin(state['yaw']) * dt
            state['battery'] = max(5.0, state['battery'] - (abs(state['vx']) * 0.005 + 0.001) * dt)

            # Publish RobotPose
            pose_msg = RobotPose()
            pose_msg.robot_id = rid
            pose_msg.x = float(state['x'])
            pose_msg.y = float(state['y'])
            pose_msg.yaw = float(state['yaw'])
            pose_msg.velocity = float(state['vx'])
            pose_msg.timestamp = now
            self.pose_pubs[rid].publish(pose_msg)

            # Publish Odometry
            odom_msg = Odometry()
            odom_msg.header.stamp = self.get_clock().now().to_msg()
            odom_msg.header.frame_id = f'{rid}/odom'
            odom_msg.child_frame_id = f'{rid}/base_footprint'
            odom_msg.pose.pose.position.x = float(state['x'])
            odom_msg.pose.pose.position.y = float(state['y'])
            odom_msg.pose.pose.position.z = 0.0
            odom_msg.pose.pose.orientation.z = math.sin(state['yaw'] / 2.0)
            odom_msg.pose.pose.orientation.w = math.cos(state['yaw'] / 2.0)
            odom_msg.twist.twist.linear.x = float(state['vx'])
            odom_msg.twist.twist.angular.z = float(state['wz'])
            self.odom_pubs[rid].publish(odom_msg)

            # Publish simulated 2D LaserScan
            scan_msg = LaserScan()
            scan_msg.header.stamp = self.get_clock().now().to_msg()
            scan_msg.header.frame_id = f'{rid}/laser_link'
            scan_msg.angle_min = -math.pi
            scan_msg.angle_max = math.pi
            scan_msg.angle_increment = math.pi / 180.0
            scan_msg.time_increment = 0.0
            scan_msg.scan_time = 0.05
            scan_msg.range_min = 0.12
            scan_msg.range_max = 12.0
            # Simple synthetic ranges (open warehouse floor)
            scan_msg.ranges = [min(10.0, max(0.5, 3.0 + 0.5 * math.sin(i * 0.1))) for i in range(360)]
            self.scan_pubs[rid].publish(scan_msg)

            # Publish BatteryStatus
            batt_msg = BatteryStatus()
            batt_msg.robot_id = rid
            batt_msg.percentage = float(state['battery'])
            batt_msg.voltage = float(state['voltage'])
            batt_msg.timestamp = now
            self.batt_pubs[rid].publish(batt_msg)

def main(args=None):
    rclpy.init(args=args)
    node = FleetMockSim()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
