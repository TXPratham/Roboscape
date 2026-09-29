#!/usr/bin/env python3
import os
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, GroupAction, LogInfo
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    # Launch arguments
    use_sim_time_arg = DeclareLaunchArgument(
        'use_sim_time', default_value='false',
        description='Use simulation (Gazebo) clock if true'
    )
    enable_rosbridge_arg = DeclareLaunchArgument(
        'enable_rosbridge', default_value='true',
        description='Launch rosbridge_server WebSocket on port 9090 for web_sim dashboard'
    )
    enable_impairment_arg = DeclareLaunchArgument(
        'enable_impairment', default_value='false',
        description='Enable 6G dataset-driven latency and packet loss network impairment node'
    )
    num_robots_arg = DeclareLaunchArgument(
        'num_robots', default_value='3',
        description='Number of AMRs in the warehouse fleet'
    )

    use_sim_time = LaunchConfiguration('use_sim_time')
    enable_rosbridge = LaunchConfiguration('enable_rosbridge')
    enable_impairment = LaunchConfiguration('enable_impairment')

    actions = [
        use_sim_time_arg,
        enable_rosbridge_arg,
        enable_impairment_arg,
        num_robots_arg,
        LogInfo(msg='=== [FLEET_BRINGUP] Launching Full Autonomous Multi-AMR Warehouse Fleet System ===')
    ]

    # 1. Rosbridge WebSocket for Three.js web_sim visualization (port 9090)
    rosbridge_node = Node(
        package='rosbridge_server',
        executable='rosbridge_websocket',
        name='rosbridge_websocket',
        parameters=[{
            'port': 9090,
            'address': '0.0.0.0',
            'use_sim_time': use_sim_time
        }],
        output='screen',
        condition=IfCondition(enable_rosbridge)
    )
    actions.append(rosbridge_node)

    # 2. Warehouse Simulation / Fleet Mock Simulator (Physics, Odom, Laser Scans)
    sim_node = Node(
        package='warehouse_sim',
        executable='fleet_mock_sim',
        name='fleet_mock_sim',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    actions.append(sim_node)

    # 3. Fleet Comms Global Services: Logger & 6G Network Impairment Node
    comms_logger = Node(
        package='fleet_comms',
        executable='comms_logger_node',
        name='comms_logger_node',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    actions.append(comms_logger)

    impairment_node = Node(
        package='fleet_comms',
        executable='network_impairment_node',
        name='network_impairment_node',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen',
        condition=IfCondition(enable_impairment)
    )
    actions.append(impairment_node)

    # 4. Fleet Safety: 50 Hz Emergency Stop & Deadlock Detector
    estop_node = Node(
        package='fleet_safety',
        executable='emergency_stop',
        name='emergency_stop',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    deadlock_node = Node(
        package='fleet_safety',
        executable='deadlock_detector',
        name='deadlock_detector',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    actions.extend([estop_node, deadlock_node])

    # 5. Fleet Tasks: Auctioneer, Task Generator & Metrics Collector
    auctioneer_node = Node(
        package='fleet_tasks',
        executable='auctioneer_node',
        name='auctioneer_node',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    task_gen_node = Node(
        package='fleet_tasks',
        executable='task_generator',
        name='task_generator',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    metrics_node = Node(
        package='fleet_tasks',
        executable='metrics_collector',
        name='metrics_collector',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    actions.extend([auctioneer_node, task_gen_node, metrics_node])

    # 6. Per-Robot Nodes (Namespaced for robot_1, robot_2, robot_3)
    for i in range(1, 4):
        rid = f'robot_{i}'
        robot_group = GroupAction([
            PushRosNamespace(rid),
            # Comms: State Publisher (10 Hz)
            Node(
                package='fleet_comms',
                executable='state_publisher',
                name='state_publisher',
                parameters=[{'robot_id': rid, 'use_sim_time': use_sim_time}],
                output='screen'
            ),
            # Comms: State Listener (Peer tracking)
            Node(
                package='fleet_comms',
                executable='state_listener',
                name='state_listener',
                parameters=[{'robot_id': rid, 'use_sim_time': use_sim_time}],
                output='screen'
            ),
            # Safety: Intersection Reservation Node
            Node(
                package='fleet_safety',
                executable='reservation_node',
                name='reservation_node',
                parameters=[{'robot_id': rid, 'use_sim_time': use_sim_time}],
                output='screen'
            ),
            # Tasks: Auction Bidder Node (6G-aware)
            Node(
                package='fleet_tasks',
                executable='bidder_node',
                name='bidder_node',
                parameters=[{'robot_id': rid, 'use_sim_time': use_sim_time}],
                output='screen'
            ),
            # Navigation: Reroute Node (D* Lite replanning)
            Node(
                package='fleet_nav',
                executable='reroute_node',
                name='reroute_node',
                parameters=[{'robot_id': rid, 'use_sim_time': use_sim_time}],
                output='screen'
            ),
        ])
        actions.append(robot_group)

    return LaunchDescription(actions)
