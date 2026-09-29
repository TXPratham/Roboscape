#!/usr/bin/env python3
"""
Auction-Based Task Allocation & Re-assignment Node (Contract Net Protocol)
Part of SIH 2026 Decentralized Task Manager (task-manager)

Calculates AMR bid costs using industrial_robot_control_6G_network.csv:
- Evaluates:
    1. Distance from robot to task source (meters)
    2. 6G Network Latency (ms)
    3. Energy Consumption (kWh)
- Cost Formula:
    Bid Cost = (w_dist * Distance) + (w_lat * network_latency) + (w_energy * energy_consumption)
    High latency or high energy consumption -> Higher bid -> Less likely to win.
- Re-assignment Protocol:
    Simulates packet_loss_rate degradation. If task ACK packet is lost or delayed past
    deadline, the task is revoked and re-assigned to the second-best bidder.
"""

import os
import csv
import math
import random
import time

class AuctionTaskManager:
    def __init__(self, network_dataset_path='datasets/Industry Robot/industrial_robot_control_6G_network.csv'):
        self.network_dataset_path = network_dataset_path
        self.robot_telemetry_profiles = {}
        self.w_dist = 0.50
        self.w_lat = 0.25
        self.w_energy = 0.35
        self.load_network_profiles()

    def load_network_profiles(self):
        if not os.path.exists(self.network_dataset_path):
            print(f"[AuctionTaskManager] Dataset not found at {self.network_dataset_path}")
            return

        with open(self.network_dataset_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                rid = row['robot_id']
                if rid not in self.robot_telemetry_profiles:
                    self.robot_telemetry_profiles[rid] = []

                self.robot_telemetry_profiles[rid].append({
                    'network_latency': float(row['network_latency']),
                    'energy_consumption': float(row['energy_consumption']),
                    'packet_loss_rate': float(row['packet_loss_rate']),
                    'total_delay': float(row['total_delay']),
                    'task_type': row['task_type']
                })

        print(f"[AuctionTaskManager] Loaded 6G network telemetry profiles for {len(self.robot_telemetry_profiles)} AMR units.")

    def get_latest_robot_metrics(self, robot_id):
        """Returns representative (network_latency, energy_consumption, packet_loss_rate) for an AMR."""
        profiles = self.robot_telemetry_profiles.get(robot_id)
        if not profiles:
            # Default fallback for robot-1, robot-2, robot-3
            idx = int(robot_id.split('-')[-1]) if '-' in robot_id else 1
            key = f"R00{idx}"
            profiles = self.robot_telemetry_profiles.get(key, [{'network_latency': 15.0, 'energy_consumption': 5.0, 'packet_loss_rate': 2.0}])

        sample = random.choice(profiles)
        return sample['network_latency'], sample['energy_consumption'], sample['packet_loss_rate']

    def calculate_bid_cost(self, robot_id, robot_pos, task_pos):
        """
        Cost function including spatial distance, network latency, and energy consumption.
        Higher latency or higher energy consumption produces higher bid cost.
        """
        dist = math.hypot(robot_pos[0] - task_pos[0], robot_pos[1] - task_pos[1])
        latency, energy, packet_loss = self.get_latest_robot_metrics(robot_id)

        bid_cost = (self.w_dist * dist) + (self.w_lat * latency) + (self.w_energy * energy)
        return {
            'robot_id': robot_id,
            'bid_cost': round(bid_cost, 2),
            'distance': round(dist, 2),
            'network_latency': latency,
            'energy_consumption': energy,
            'packet_loss_rate': packet_loss
        }

    def conduct_auction(self, task_id, task_pos, active_robots):
        """
        Conducts Contract Net Protocol auction among available robots.
        Returns winning robot and handles packet-loss re-assignment if transmission fails.
        """
        bids = []
        for robot in active_robots:
            bid = self.calculate_bid_cost(robot['id'], (robot['x'], robot['z']), task_pos)
            bids.append(bid)

        # Sort bids: lowest cost wins
        bids.sort(key=lambda b: b['bid_cost'])
        winning_bid = bids[0]

        print(f"\n[AUCTION] Task {task_id} Bidding Results:")
        for b in bids:
            print(f"  - [{b['robot_id']}] Bid: ${b['bid_cost']:.2f} (Dist: {b['distance']}m, Latency: {b['network_latency']:.1f}ms, Energy: {b['energy_consumption']:.1f}kWh)")

        # Test Re-assignment Logic: Artificially inject packet loss
        simulated_loss = winning_bid['packet_loss_rate']
        random_roll = random.uniform(0, 100)

        if random_roll < simulated_loss:
            # Packet loss triggered! Re-assign to runner-up
            runner_up = bids[1] if len(bids) > 1 else winning_bid
            print(f"  [RE-ASSIGNMENT ALERT] Packet loss triggered ({simulated_loss:.1f}% loss rate). Task ACK lost!")
            print(f"  Task {task_id} re-assigned from {winning_bid['robot_id']} to Runner-Up {runner_up['robot_id']}!")
            return runner_up, bids
        else:
            print(f"  [AWARD] Task {task_id} awarded to {winning_bid['robot_id']} (${winning_bid['bid_cost']:.2f})")
            return winning_bid, bids

if __name__ == '__main__':
    manager = AuctionTaskManager()
    sample_robots = [
        {'id': 'robot-1', 'x': -7.0, 'z': 7.0},
        {'id': 'robot-2', 'x': 0.0, 'z': 7.0},
        {'id': 'robot-3', 'x': 7.0, 'z': 7.0}
    ]
    task_target = (-3.5, 8.5)
    winner, all_bids = manager.conduct_auction('TASK-105', task_target, sample_robots)
