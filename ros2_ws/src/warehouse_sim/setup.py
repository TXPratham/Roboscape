import os
from glob import glob
from setuptools import setup

package_name = 'warehouse_sim'

setup(
    name=package_name,
    version='1.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name] if os.path.exists('resource/' + package_name) else []),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
        (os.path.join('share', package_name, 'worlds'), glob('worlds/*')),
        (os.path.join('share', package_name, 'urdf'), glob('urdf/*')),
        (os.path.join('share', package_name, 'config'), glob('config/*')),
        (os.path.join('share', package_name, 'maps'), glob('maps/*')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Warehouse Fleet Team',
    maintainer_email='sim@warehouse.local',
    description='Warehouse simulation world and multi-AMR spawner',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'fleet_mock_sim = warehouse_sim.fleet_mock_sim:main',
            'robot_spawner = warehouse_sim.robot_spawner:main',
        ],
    },
)
