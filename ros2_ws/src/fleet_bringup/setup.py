import os
from glob import glob
from setuptools import setup

package_name = 'fleet_bringup'

setup(
    name=package_name,
    version='1.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name] if os.path.exists('resource/' + package_name) else []),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
        (os.path.join('share', package_name, 'config'), glob('config/*')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Warehouse Fleet Team',
    maintainer_email='bringup@warehouse.local',
    description='Fleet bringup launching full multi-AMR warehouse system',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
        ],
    },
)
