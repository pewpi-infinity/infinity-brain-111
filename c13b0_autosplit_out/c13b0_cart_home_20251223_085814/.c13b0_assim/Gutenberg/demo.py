#!/usr/bin/env python3
"""
Example demonstration of the Progress Monitor system.

This script demonstrates how to use the progress monitor to:
1. Keep an eye on the prize (goal)
2. Track progress without failing partway through
3. Recover from failures using checkpoints
"""

import time
import random
from progress_monitor import ProgressMonitor


def simulate_work(duration=0.5):
    """Simulate some work being done."""
    time.sleep(duration)


def main():
    print("=" * 70)
    print("Progress Monitor Demo: Don't Let ChatGPT Fail Partway Through!")
    print("=" * 70)
    print()
    
    # Create a progress monitor
    monitor = ProgressMonitor(
        "Complete the Gutenberg project without failing",
        "demo_progress.json"
    )
    
    # Define our tasks
    tasks = [
        ("research", "Research Phase", "Research requirements and technologies"),
        ("design", "Design Phase", "Create system architecture and designs"),
        ("implement", "Implementation Phase", "Build the core functionality"),
        ("test", "Testing Phase", "Test all components thoroughly"),
        ("deploy", "Deployment Phase", "Deploy to production")
    ]
    
    # Add all tasks
    print("📋 Setting up tasks...")
    for task_id, name, description in tasks:
        monitor.add_task(task_id, name, description)
    print()
    
    monitor.print_status()
    
    # Work through each task
    for task_id, name, description in tasks:
        print(f"\n{'=' * 70}")
        print(f"🚀 Starting: {name}")
        print(f"{'=' * 70}\n")
        
        monitor.start_task(task_id)
        simulate_work(0.3)
        
        # Progress through the task with checkpoints
        checkpoints = [
            (25, f"{name} - Initial setup"),
            (50, f"{name} - Halfway complete"),
            (75, f"{name} - Almost done")
        ]
        
        for progress, checkpoint_name in checkpoints:
            print(f"📊 Progress: {progress}% - {checkpoint_name}")
            monitor.update_progress(task_id, progress, checkpoint_name)
            simulate_work(0.3)
            
            # Simulate a random failure (10% chance)
            if random.random() < 0.1:
                print(f"\n⚠️  Simulating failure at {progress}%...")
                monitor.fail_task(task_id, "Simulated connection timeout")
                simulate_work(0.5)
                
                print("🔄 Recovering from last checkpoint...")
                checkpoint = monitor.recover_task(task_id)
                if checkpoint:
                    print(f"   ✅ Recovered from: {checkpoint['name']}")
                    print(f"   📊 Restored progress: {checkpoint['progress']}%")
                simulate_work(0.5)
        
        # Complete the task
        print(f"📊 Progress: 100% - {name} complete!")
        monitor.update_progress(task_id, 100)
        monitor.complete_task(task_id)
        simulate_work(0.3)
        
        # Show current status
        monitor.print_status()
    
    # Final summary
    print("\n" + "=" * 70)
    print("📊 FINAL SUMMARY")
    print("=" * 70)
    
    report = monitor.get_status_report()
    print(f"\n🎯 Goal: {report['goal']}")
    print(f"📈 Overall Progress: {report['overall_progress']:.1f}%")
    print(f"✅ Goal Achieved: {report['goal_achieved']}")
    
    if report['goal_achieved']:
        print("\n" + "🎉" * 20)
        print("🎉 CONGRATULATIONS! All tasks completed successfully! 🎉")
        print("🎉 The prize is yours - no failures along the way! 🎉")
        print("🎉" * 20)
    
    print(f"\n💾 Progress saved to: demo_progress.json")
    print("\nYou can restore this progress anytime by loading the state file!")
    print()


if __name__ == "__main__":
    main()
