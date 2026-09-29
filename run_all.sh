#!/bin/bash
# run_all.sh — Launch the full AMR fleet system in one command

# --- Setup ---
source /opt/ros/humble/setup.bash
source ~/sih2026/ros2_ws/install/setup.bash
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

# --- Cleanup: kill everything when you press Ctrl+C ---
cleanup() {
    trap - SIGINT SIGTERM EXIT
    echo ""
    echo "🛑 Shutting down all nodes..."
    pkill -P $$ 2>/dev/null
    kill 0 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Free port 8000 if occupied
fuser -k 8000/tcp 2>/dev/null || true

# --- 1. Start the Web HTTP server (background) ---
echo "🌐 Starting web dashboard on http://localhost:8000"
cd ~/sih2026/web_sim
python3 -m http.server 8000 > /tmp/web_sim.log 2>&1 &
cd ~/sih2026

# --- 2. Start the Fleet backend + Rosbridge (foreground) ---
echo "🤖 Starting fleet system and Rosbridge on ws://localhost:9090..."
echo ""
echo "Dashboard:  http://localhost:8000"
echo "Rosbridge:  ws://localhost:9090"
echo "Press Ctrl+C to stop everything."
echo "----------------------------------------"
ros2 launch fleet_bringup full_system.launch.py

# When the launch file exits, cleanup runs automatically
