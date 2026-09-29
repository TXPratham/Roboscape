#!/usr/bin/env python3
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, GroupAction
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    pkg_share = get_package_share_directory('warehouse_sim')
    
    use_sim_time_arg = DeclareLaunchArgument('use_sim_time', default_value='false')
    num_robots_arg = DeclareLaunchArgument('num_robots', default_value='3')

    # Core mock & physics simulation engine node
    sim_node = Node(
        package='warehouse_sim',
        executable='fleet_mock_sim',
        name='fleet_mock_sim',
        output='screen'
    )

    actions = [use_sim_time_arg, num_robots_arg, sim_node]

    # Spawn state publishers per robot namespace
    for i in range(1, 4):
        rid = f'robot_{i}'
        robot_group = GroupAction([
            PushRosNamespace(rid),
            Node(
                package='warehouse_sim',
                executable='robot_spawner',
                name='spawner_status',
                parameters=[{'robot_id': rid}],
                output='screen'
            )
        ])
        actions.append(robot_group)

    return LaunchDescription(actions)
