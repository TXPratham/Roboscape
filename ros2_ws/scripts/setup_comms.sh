#!/usr/bin/env bash
# Comms Architect: Setup CycloneDDS and ROS 2 Environment

export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
WS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f "$WS_DIR/src/fleet_comms/config/cyclonedds.xml" ]; then
    export CYCLONEDDS_URI="file://$WS_DIR/src/fleet_comms/config/cyclonedds.xml"
elif [ -f "$WS_DIR/install/fleet_comms/share/fleet_comms/config/cyclonedds.xml" ]; then
    export CYCLONEDDS_URI="file://$WS_DIR/install/fleet_comms/share/fleet_comms/config/cyclonedds.xml"
fi

if [ -z "$ROS_DOMAIN_ID" ]; then
    export ROS_DOMAIN_ID=42
fi

echo "============================================="
echo " Multi-AMR DDS Comms Environment Configured "
echo " RMW_IMPLEMENTATION : $RMW_IMPLEMENTATION"
echo " CYCLONEDDS_URI     : $CYCLONEDDS_URI"
echo " ROS_DOMAIN_ID      : $ROS_DOMAIN_ID"
echo "============================================="
