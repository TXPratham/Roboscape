#!/usr/bin/env python3
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, GroupAction
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    pkg_share = get_package_share_directory('fleet_nav')
    use_sim_time_arg = DeclareLaunchArgument('use_sim_time', default_value='false')
    num_robots_arg = DeclareLaunchArgument('num_robots', default_value='3')

    actions = [use_sim_time_arg, num_robots_arg]

    for i in range(1, 4):
        rid = f'robot_{i}'
        param_file = os.path.join(pkg_share, 'params', f'nav2_params_robot_{i}.yaml')

        group = GroupAction([
            PushRosNamespace(rid),
            Node(
                package='fleet_nav',
                executable='reroute_node',
                name='reroute_node',
                parameters=[{'robot_id': rid}],
                output='screen'
            )
        ])
        actions.append(group)

    return LaunchDescription(actions)
