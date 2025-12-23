"""
Progress Monitor - A system to track progress towards goals and prevent partial failures.

This module provides functionality to:
1. Monitor progress towards defined goals
2. Track completion status
3. Implement checkpoints to prevent partial failures
4. Provide recovery mechanisms
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum


class TaskStatus(Enum):
    """Status of a task in the progress monitoring system."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    RECOVERED = "recovered"


@dataclass
class Task:
    """Represents a task that contributes to the overall goal."""
    id: str
    name: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    progress_percentage: float = 0.0
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    checkpoints: List[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.checkpoints is None:
            self.checkpoints = []
        if self.metadata is None:
            self.metadata = {}


class ProgressMonitor:
    """
    Monitors progress towards a goal and ensures tasks don't fail partway through.
    
    Features:
    - Track multiple tasks towards a goal
    - Checkpoint system for recovery
    - Progress reporting
    - Failure detection and recovery
    """

    def __init__(self, goal: str, state_file: str = "progress_state.json"):
        """
        Initialize the progress monitor.
        
        Args:
            goal: The main goal/prize to keep focus on
            state_file: Path to file for persisting state
        """
        self.goal = goal
        self.state_file = state_file
        self.tasks: Dict[str, Task] = {}
        self.started_at: Optional[str] = None
        self.completed_at: Optional[str] = None
        self.load_state()

    def add_task(self, task_id: str, name: str, description: str) -> Task:
        """
        Add a new task to monitor.
        
        Args:
            task_id: Unique identifier for the task
            name: Short name for the task
            description: Detailed description of the task
            
        Returns:
            The created Task object
        """
        task = Task(
            id=task_id,
            name=name,
            description=description
        )
        self.tasks[task_id] = task
        self.save_state()
        return task

    def start_task(self, task_id: str) -> None:
        """
        Mark a task as started.
        
        Args:
            task_id: ID of the task to start
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task = self.tasks[task_id]
        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.now().isoformat()
        
        if self.started_at is None:
            self.started_at = task.started_at
        
        self.save_state()

    def update_progress(self, task_id: str, percentage: float, checkpoint: Optional[str] = None) -> None:
        """
        Update the progress of a task.
        
        Args:
            task_id: ID of the task to update
            percentage: Progress percentage (0-100)
            checkpoint: Optional checkpoint name for recovery
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task = self.tasks[task_id]
        task.progress_percentage = min(100.0, max(0.0, percentage))
        
        if checkpoint:
            task.checkpoints.append({
                "name": checkpoint,
                "timestamp": datetime.now().isoformat(),
                "progress": percentage
            })
        
        self.save_state()

    def complete_task(self, task_id: str) -> None:
        """
        Mark a task as completed.
        
        Args:
            task_id: ID of the task to complete
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task = self.tasks[task_id]
        task.status = TaskStatus.COMPLETED
        task.progress_percentage = 100.0
        task.completed_at = datetime.now().isoformat()
        
        self.save_state()

    def fail_task(self, task_id: str, reason: str = "") -> None:
        """
        Mark a task as failed.
        
        Args:
            task_id: ID of the task that failed
            reason: Optional reason for failure
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task = self.tasks[task_id]
        task.status = TaskStatus.FAILED
        task.metadata['failure_reason'] = reason
        task.metadata['failed_at'] = datetime.now().isoformat()
        
        self.save_state()

    def recover_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Recover a failed task from the last checkpoint.
        
        Args:
            task_id: ID of the task to recover
            
        Returns:
            Last checkpoint information if available, None otherwise
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task = self.tasks[task_id]
        
        if not task.checkpoints:
            return None
        
        last_checkpoint = task.checkpoints[-1]
        task.status = TaskStatus.RECOVERED
        task.progress_percentage = last_checkpoint['progress']
        
        self.save_state()
        return last_checkpoint

    def get_overall_progress(self) -> float:
        """
        Calculate overall progress across all tasks.
        
        Returns:
            Overall progress percentage (0-100)
        """
        if not self.tasks:
            return 0.0
        
        total_progress = sum(task.progress_percentage for task in self.tasks.values())
        return total_progress / len(self.tasks)

    def is_goal_achieved(self) -> bool:
        """
        Check if the goal has been achieved (all tasks completed).
        
        Returns:
            True if all tasks are completed, False otherwise
        """
        if not self.tasks:
            return False
        
        return all(task.status == TaskStatus.COMPLETED for task in self.tasks.values())

    def get_status_report(self) -> Dict[str, Any]:
        """
        Get a comprehensive status report.
        
        Returns:
            Dictionary containing status information
        """
        return {
            "goal": self.goal,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "overall_progress": self.get_overall_progress(),
            "goal_achieved": self.is_goal_achieved(),
            "tasks": {
                task_id: {
                    "name": task.name,
                    "status": task.status.value,
                    "progress": task.progress_percentage,
                    "checkpoints": len(task.checkpoints)
                }
                for task_id, task in self.tasks.items()
            }
        }

    def print_status(self) -> None:
        """Print a human-readable status report."""
        print(f"\n{'='*60}")
        print(f"Goal: {self.goal}")
        print(f"{'='*60}")
        print(f"Overall Progress: {self.get_overall_progress():.1f}%")
        print(f"Goal Achieved: {self.is_goal_achieved()}")
        print(f"\nTasks:")
        
        for task_id, task in self.tasks.items():
            status_symbol = {
                TaskStatus.PENDING: "⏸️",
                TaskStatus.IN_PROGRESS: "🔄",
                TaskStatus.COMPLETED: "✅",
                TaskStatus.FAILED: "❌",
                TaskStatus.RECOVERED: "♻️"
            }.get(task.status, "❓")
            
            print(f"  {status_symbol} [{task.progress_percentage:5.1f}%] {task.name}")
            print(f"      Status: {task.status.value}")
            if task.checkpoints:
                print(f"      Checkpoints: {len(task.checkpoints)}")
        
        print(f"{'='*60}\n")

    def save_state(self) -> None:
        """Save the current state to a file."""
        state = {
            "goal": self.goal,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "tasks": {
                task_id: {
                    **asdict(task),
                    "status": task.status.value
                }
                for task_id, task in self.tasks.items()
            }
        }
        
        with open(self.state_file, 'w') as f:
            json.dump(state, f, indent=2)

    def load_state(self) -> None:
        """Load state from a file if it exists."""
        if not os.path.exists(self.state_file):
            return
        
        try:
            with open(self.state_file, 'r') as f:
                state = json.load(f)
            
            self.goal = state.get("goal", self.goal)
            self.started_at = state.get("started_at")
            self.completed_at = state.get("completed_at")
            
            for task_id, task_data in state.get("tasks", {}).items():
                task_data["status"] = TaskStatus(task_data["status"])
                self.tasks[task_id] = Task(**task_data)
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Warning: Could not load state from {self.state_file}: {e}")


# Example usage
if __name__ == "__main__":
    # Create a progress monitor for a goal
    monitor = ProgressMonitor("Complete the Gutenberg project without failing")
    
    # Add tasks
    monitor.add_task("design", "Design System", "Create the design system for the project")
    monitor.add_task("implementation", "Implementation", "Implement the core functionality")
    monitor.add_task("testing", "Testing", "Test all components")
    monitor.add_task("documentation", "Documentation", "Write comprehensive documentation")
    
    # Simulate progress
    monitor.start_task("design")
    monitor.update_progress("design", 50, "Initial mockups completed")
    monitor.update_progress("design", 100, "Final designs approved")
    monitor.complete_task("design")
    
    monitor.start_task("implementation")
    monitor.update_progress("implementation", 30, "Core modules implemented")
    monitor.update_progress("implementation", 60, "API integration complete")
    
    # Print status
    monitor.print_status()
    
    # Demonstrate recovery
    print("Simulating a failure and recovery...")
    monitor.fail_task("implementation", "Connection timeout")
    checkpoint = monitor.recover_task("implementation")
    if checkpoint:
        print(f"Recovered from checkpoint: {checkpoint['name']} at {checkpoint['progress']}%")
    
    # Continue and complete
    monitor.update_progress("implementation", 100)
    monitor.complete_task("implementation")
    
    monitor.start_task("testing")
    monitor.complete_task("testing")
    
    monitor.start_task("documentation")
    monitor.complete_task("documentation")
    
    # Final status
    monitor.print_status()
