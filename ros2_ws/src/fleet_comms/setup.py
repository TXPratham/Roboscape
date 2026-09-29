import os
from glob import glob
from setuptools import setup

package_name = 'fleet_comms'

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
    maintainer='Comms Architect',
    maintainer_email='comms@warehouse.local',
    description='Fleet DDS peer-to-peer communication nodes and configuration',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'state_publisher = fleet_comms.state_publisher:main',
            'state_listener = fleet_comms.state_listener:main',
            'comms_logger_node = fleet_comms.comms_logger_node:main',
            'network_impairment_node = fleet_comms.network_impairment_node:main',
        ],
    },
)
