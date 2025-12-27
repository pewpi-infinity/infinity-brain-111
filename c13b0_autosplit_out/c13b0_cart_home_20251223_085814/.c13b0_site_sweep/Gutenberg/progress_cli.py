#!/usr/bin/env python3
"""
Progress Monitor CLI - Command line interface for monitoring progress towards goals.

This CLI tool helps you:
- Keep an eye on the prize (goal)
- Track progress without failing partway through
- Recover from failures using checkpoints
"""

import argparse
import sys
from progress_monitor import ProgressMonitor


def create_monitor(args):
    """Create a new progress monitor."""
    monitor = ProgressMonitor(args.goal, args.state_file)
    print(f"✅ Created progress monitor for goal: '{args.goal}'")
    print(f"📁 State will be saved to: {args.state_file}")
    monitor.save_state()


def add_task(args):
    """Add a new task to monitor."""
    monitor = ProgressMonitor("", args.state_file)
    task = monitor.add_task(args.task_id, args.name, args.description)
    print(f"✅ Added task '{args.name}' (ID: {args.task_id})")


def start_task(args):
    """Start a task."""
    monitor = ProgressMonitor("", args.state_file)
    monitor.start_task(args.task_id)
    print(f"🔄 Started task: {args.task_id}")
    monitor.print_status()


def update_progress(args):
    """Update task progress."""
    monitor = ProgressMonitor("", args.state_file)
    monitor.update_progress(args.task_id, args.percentage, args.checkpoint)
    checkpoint_msg = f" (checkpoint: {args.checkpoint})" if args.checkpoint else ""
    print(f"📊 Updated progress for {args.task_id}: {args.percentage}%{checkpoint_msg}")
    monitor.print_status()


def complete_task(args):
    """Complete a task."""
    monitor = ProgressMonitor("", args.state_file)
    monitor.complete_task(args.task_id)
    print(f"✅ Completed task: {args.task_id}")
    monitor.print_status()
    
    if monitor.is_goal_achieved():
        print("\n🎉 CONGRATULATIONS! Goal achieved! All tasks completed! 🎉\n")


def fail_task(args):
    """Fail a task."""
    monitor = ProgressMonitor("", args.state_file)
    monitor.fail_task(args.task_id, args.reason)
    print(f"❌ Task failed: {args.task_id}")
    if args.reason:
        print(f"   Reason: {args.reason}")
    monitor.print_status()


def recover_task(args):
    """Recover a failed task."""
    monitor = ProgressMonitor("", args.state_file)
    checkpoint = monitor.recover_task(args.task_id)
    
    if checkpoint:
        print(f"♻️  Recovered task {args.task_id} from checkpoint:")
        print(f"   Name: {checkpoint['name']}")
        print(f"   Progress: {checkpoint['progress']}%")
        print(f"   Timestamp: {checkpoint['timestamp']}")
    else:
        print(f"⚠️  No checkpoint found for task {args.task_id}")
    
    monitor.print_status()


def show_status(args):
    """Show current status."""
    monitor = ProgressMonitor("", args.state_file)
    monitor.print_status()
    
    if args.verbose:
        import json
        print("\nDetailed Status:")
        print(json.dumps(monitor.get_status_report(), indent=2))


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Progress Monitor - Keep an eye on the prize, don't fail partway through!",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create a new monitor
  %(prog)s create --goal "Complete the project"
  
  # Add tasks
  %(prog)s add-task --task-id task1 --name "Design" --description "Create designs"
  
  # Start and track a task
  %(prog)s start --task-id task1
  %(prog)s update --task-id task1 --percentage 50 --checkpoint "Mockups done"
  %(prog)s complete --task-id task1
  
  # Handle failures
  %(prog)s fail --task-id task1 --reason "Connection lost"
  %(prog)s recover --task-id task1
  
  # Check status
  %(prog)s status
        """
    )
    
    parser.add_argument(
        '--state-file',
        default='progress_state.json',
        help='Path to state file (default: progress_state.json)'
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create a new progress monitor')
    create_parser.add_argument('--goal', required=True, help='The goal to achieve')
    create_parser.set_defaults(func=create_monitor)
    
    # Add task command
    add_parser = subparsers.add_parser('add-task', help='Add a new task')
    add_parser.add_argument('--task-id', required=True, help='Unique task ID')
    add_parser.add_argument('--name', required=True, help='Task name')
    add_parser.add_argument('--description', required=True, help='Task description')
    add_parser.set_defaults(func=add_task)
    
    # Start task command
    start_parser = subparsers.add_parser('start', help='Start a task')
    start_parser.add_argument('--task-id', required=True, help='Task ID to start')
    start_parser.set_defaults(func=start_task)
    
    # Update progress command
    update_parser = subparsers.add_parser('update', help='Update task progress')
    update_parser.add_argument('--task-id', required=True, help='Task ID to update')
    update_parser.add_argument('--percentage', type=float, required=True, help='Progress percentage (0-100)')
    update_parser.add_argument('--checkpoint', help='Optional checkpoint name')
    update_parser.set_defaults(func=update_progress)
    
    # Complete task command
    complete_parser = subparsers.add_parser('complete', help='Complete a task')
    complete_parser.add_argument('--task-id', required=True, help='Task ID to complete')
    complete_parser.set_defaults(func=complete_task)
    
    # Fail task command
    fail_parser = subparsers.add_parser('fail', help='Mark a task as failed')
    fail_parser.add_argument('--task-id', required=True, help='Task ID that failed')
    fail_parser.add_argument('--reason', default='', help='Reason for failure')
    fail_parser.set_defaults(func=fail_task)
    
    # Recover task command
    recover_parser = subparsers.add_parser('recover', help='Recover a failed task')
    recover_parser.add_argument('--task-id', required=True, help='Task ID to recover')
    recover_parser.set_defaults(func=recover_task)
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Show current status')
    status_parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed status')
    status_parser.set_defaults(func=show_status)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    try:
        args.func(args)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
