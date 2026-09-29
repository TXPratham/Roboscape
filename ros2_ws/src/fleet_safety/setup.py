import os
from glob import glob
from setuptools import setup

package_name = 'fleet_safety'

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
    maintainer='Collision Resolver',
    maintainer_email='safety@warehouse.local',
    description='Collision avoidance, deadlock detection, intersection reservation and emergency stop',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'reservation_node = fleet_safety.reservation_node:main',
            'deadlock_detector = fleet_safety.deadlock_detector:main',
            'emergency_stop = fleet_safety.emergency_stop:main',
        ],
    },
)
