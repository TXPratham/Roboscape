import os
from glob import glob
from setuptools import setup

package_name = 'fleet_tasks'

setup(
    name=package_name,
    version='1.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name] if os.path.exists('resource/' + package_name) else []),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'config'), glob('config/*')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Task Manager',
    maintainer_email='tasks@warehouse.local',
    description='Decentralized auction task allocation and metrics',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'auctioneer_node = fleet_tasks.auctioneer_node:main',
            'bidder_node = fleet_tasks.bidder_node:main',
            'task_generator = fleet_tasks.task_generator:main',
            'metrics_collector = fleet_tasks.metrics_collector:main',
            'auction_task_manager = fleet_tasks.auction_task_manager:main',
        ],
    },
)
