import os
from glob import glob
from setuptools import setup

package_name = 'fleet_nav'

setup(
    name=package_name,
    version='1.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name] if os.path.exists('resource/' + package_name) else []),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
        (os.path.join('share', package_name, 'params'), glob('params/*')),
        (os.path.join('share', package_name, 'plugins'), glob('plugins/*')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Planner Agent',
    maintainer_email='planner@warehouse.local',
    description='Fleet navigation, D* Lite re-routing and parameter files',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'reroute_node = fleet_nav.reroute_node:main',
            'historical_risk_dstar_planner = fleet_nav.historical_risk_dstar_planner:main',
        ],
    },
)
