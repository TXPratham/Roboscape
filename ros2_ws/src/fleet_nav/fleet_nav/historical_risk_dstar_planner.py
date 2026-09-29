#!/usr/bin/env python3
"""
Historical Risk-Aware D* Lite Path Planner & LiDAR Obstacle Simulator
Part of SIH 2026 Fleet Navigation (planner-agent)

Evaluates autonomous_navigation_dataset.csv:
- Categorizes paths by outcome: target in ['success', 'timeout', 'collision', 'partial']
- Extracts historical collision hotspots where collision_flag == 1
- Inflates edge traversal costs in D* Lite for collision-prone regions
- Simulates 2D LiDAR ranges (lidar_min, lidar_max) for active obstacle avoidance
"""

import os
import csv
import math

class HistoricalRiskDStarPlanner:
    def __init__(self, dataset_path='datasets/Autonomus Navigation/autonomous_navigation_dataset.csv'):
        self.dataset_path = dataset_path
        self.run_evaluations = {}
        self.collision_hotspots = []
        self.lidar_profiles = {}
        self.load_dataset()

    def load_dataset(self):
        if not os.path.exists(self.dataset_path):
            print(f"[HistoricalRiskDStarPlanner] Dataset not found at {self.dataset_path}")
            return

        with open(self.dataset_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                run_id = int(row['run_id'])
                target = row['target']
                x = float(row['x'])
                y = float(row['y'])
                collision = int(row['collision_flag'])
                lidar_min = float(row['lidar_min'])
                lidar_max = float(row['lidar_max'])

                if run_id not in self.run_evaluations:
                    self.run_evaluations[run_id] = {
                        'target': target,
                        'total_points': 0,
                        'collisions': 0,
                        'lidar_mins': [],
                        'lidar_maxs': [],
                        'path': []
                    }

                eval_data = self.run_evaluations[run_id]
                eval_data['total_points'] += 1
                eval_data['path'].append((x, y))
                eval_data['lidar_mins'].append(lidar_min)
                eval_data['lidar_maxs'].append(lidar_max)

                if collision == 1 or target == 'collision':
                    eval_data['collisions'] += 1
                    self.collision_hotspots.append({
                        'x': x,
                        'y': y,
                        'run_id': run_id,
                        'lidar_min': lidar_min
                    })

        # Summary statistics
        total_runs = len(self.run_evaluations)
        success_runs = sum(1 for r in self.run_evaluations.values() if r['target'] == 'success')
        collision_runs = sum(1 for r in self.run_evaluations.values() if r['target'] == 'collision')
        timeout_runs = sum(1 for r in self.run_evaluations.values() if r['target'] == 'timeout')

        print(f"[HistoricalRiskDStarPlanner] Evaluated {total_runs} runs:")
        print(f"  - Success: {success_runs} ({success_runs/total_runs*100:.1f}%)")
        print(f"  - Collisions: {collision_runs} ({collision_runs/total_runs*100:.1f}%)")
        print(f"  - Timeouts: {timeout_runs} ({timeout_runs/total_runs*100:.1f}%)")
        print(f"  - Collision Hotspots Extracted: {len(self.collision_hotspots)}")

    def get_collision_risk(self, x, y, risk_radius=1.2):
        """
        Calculates penalty multiplier for coordinates near historical collision zones.
        Avoids trajectories that historically experienced collisions or obstacle pinches.
        """
        risk_penalty = 0.0
        for spot in self.collision_hotspots:
            dist = math.hypot(x - spot['x'], y - spot['y'])
            if dist < risk_radius:
                # Proximity penalty inversely proportional to distance
                risk_penalty += (risk_radius - dist) * 15.0
        return risk_penalty

    def calculate_dstar_edge_cost(self, u_coord, v_coord):
        """
        D* Lite edge cost: base Euclidean distance + historical collision risk
        c(u, v) = dist(u, v) + Risk(v)
        """
        base_cost = math.hypot(v_coord[0] - u_coord[0], v_coord[1] - u_coord[1])
        risk_cost = self.get_collision_risk(v_coord[0], v_coord[1])
        return base_cost + risk_cost

    def simulate_lidar_scan(self, run_id, step_index):
        """
        Simulates 2D LiDAR range scan [lidar_min, lidar_max] based on dataset telemetry.
        """
        if run_id not in self.run_evaluations:
            return 0.5, 4.0

        eval_data = self.run_evaluations[run_id]
        idx = min(step_index, len(eval_data['lidar_mins']) - 1)
        return eval_data['lidar_mins'][idx], eval_data['lidar_maxs'][idx]

if __name__ == '__main__':
    planner = HistoricalRiskDStarPlanner()
    # Test collision penalty near a known hotspot
    if planner.collision_hotspots:
        spot = planner.collision_hotspots[0]
        penalty = planner.get_collision_risk(spot['x'], spot['y'])
        print(f"Sample penalty at hotspot ({spot['x']:.2f}, {spot['y']:.2f}): {penalty:.2f}")
