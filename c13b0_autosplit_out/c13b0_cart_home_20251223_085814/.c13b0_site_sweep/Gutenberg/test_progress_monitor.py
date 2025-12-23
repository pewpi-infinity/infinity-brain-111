"""
Unit tests for the Progress Monitor system.

Tests the core functionality of tracking progress towards goals
and preventing partial failures through checkpoints.
"""

import unittest
import os
import json
import tempfile
from progress_monitor import ProgressMonitor, Task, TaskStatus


class TestProgressMonitor(unittest.TestCase):
    """Test cases for ProgressMonitor class."""

    def setUp(self):
        """Set up test fixtures."""
        # Create a temporary file for state
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')
        self.temp_file.close()
        self.state_file = self.temp_file.name
        self.monitor = ProgressMonitor("Test Goal", self.state_file)

    def tearDown(self):
        """Clean up after tests."""
        if os.path.exists(self.state_file):
            os.unlink(self.state_file)

    def test_initialization(self):
        """Test monitor initialization."""
        self.assertEqual(self.monitor.goal, "Test Goal")
        self.assertEqual(len(self.monitor.tasks), 0)
        self.assertIsNone(self.monitor.started_at)
        self.assertIsNone(self.monitor.completed_at)

    def test_add_task(self):
        """Test adding tasks."""
        task = self.monitor.add_task("task1", "Task 1", "First task")
        
        self.assertIsInstance(task, Task)
        self.assertEqual(task.id, "task1")
        self.assertEqual(task.name, "Task 1")
        self.assertEqual(task.status, TaskStatus.PENDING)
        self.assertEqual(task.progress_percentage, 0.0)
        self.assertIn("task1", self.monitor.tasks)

    def test_start_task(self):
        """Test starting a task."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        
        task = self.monitor.tasks["task1"]
        self.assertEqual(task.status, TaskStatus.IN_PROGRESS)
        self.assertIsNotNone(task.started_at)
        self.assertIsNotNone(self.monitor.started_at)

    def test_start_nonexistent_task(self):
        """Test starting a task that doesn't exist."""
        with self.assertRaises(ValueError):
            self.monitor.start_task("nonexistent")

    def test_update_progress(self):
        """Test updating task progress."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        self.monitor.update_progress("task1", 50.0)
        
        task = self.monitor.tasks["task1"]
        self.assertEqual(task.progress_percentage, 50.0)

    def test_update_progress_with_checkpoint(self):
        """Test updating progress with checkpoint."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        self.monitor.update_progress("task1", 50.0, "Halfway there")
        
        task = self.monitor.tasks["task1"]
        self.assertEqual(len(task.checkpoints), 1)
        self.assertEqual(task.checkpoints[0]["name"], "Halfway there")
        self.assertEqual(task.checkpoints[0]["progress"], 50.0)

    def test_update_progress_bounds(self):
        """Test that progress is bounded between 0 and 100."""
        self.monitor.add_task("task1", "Task 1", "First task")
        
        # Test upper bound
        self.monitor.update_progress("task1", 150.0)
        self.assertEqual(self.monitor.tasks["task1"].progress_percentage, 100.0)
        
        # Test lower bound
        self.monitor.update_progress("task1", -50.0)
        self.assertEqual(self.monitor.tasks["task1"].progress_percentage, 0.0)

    def test_complete_task(self):
        """Test completing a task."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        self.monitor.complete_task("task1")
        
        task = self.monitor.tasks["task1"]
        self.assertEqual(task.status, TaskStatus.COMPLETED)
        self.assertEqual(task.progress_percentage, 100.0)
        self.assertIsNotNone(task.completed_at)

    def test_fail_task(self):
        """Test failing a task."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        self.monitor.fail_task("task1", "Connection lost")
        
        task = self.monitor.tasks["task1"]
        self.assertEqual(task.status, TaskStatus.FAILED)
        self.assertEqual(task.metadata["failure_reason"], "Connection lost")
        self.assertIn("failed_at", task.metadata)

    def test_recover_task(self):
        """Test recovering a failed task."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        self.monitor.update_progress("task1", 30.0, "Checkpoint 1")
        self.monitor.update_progress("task1", 60.0, "Checkpoint 2")
        self.monitor.fail_task("task1", "Error occurred")
        
        checkpoint = self.monitor.recover_task("task1")
        
        self.assertIsNotNone(checkpoint)
        self.assertEqual(checkpoint["name"], "Checkpoint 2")
        self.assertEqual(checkpoint["progress"], 60.0)
        
        task = self.monitor.tasks["task1"]
        self.assertEqual(task.status, TaskStatus.RECOVERED)
        self.assertEqual(task.progress_percentage, 60.0)

    def test_recover_task_no_checkpoint(self):
        """Test recovering a task with no checkpoints."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.fail_task("task1", "Error occurred")
        
        checkpoint = self.monitor.recover_task("task1")
        self.assertIsNone(checkpoint)

    def test_overall_progress(self):
        """Test calculating overall progress."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.add_task("task2", "Task 2", "Second task")
        self.monitor.add_task("task3", "Task 3", "Third task")
        
        # No progress yet
        self.assertEqual(self.monitor.get_overall_progress(), 0.0)
        
        # Update some progress
        self.monitor.update_progress("task1", 100.0)
        self.monitor.update_progress("task2", 50.0)
        self.monitor.update_progress("task3", 0.0)
        
        # Should be (100 + 50 + 0) / 3 = 50
        self.assertEqual(self.monitor.get_overall_progress(), 50.0)

    def test_overall_progress_empty(self):
        """Test overall progress with no tasks."""
        self.assertEqual(self.monitor.get_overall_progress(), 0.0)

    def test_is_goal_achieved(self):
        """Test checking if goal is achieved."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.add_task("task2", "Task 2", "Second task")
        
        # Not achieved yet
        self.assertFalse(self.monitor.is_goal_achieved())
        
        # Complete one task
        self.monitor.complete_task("task1")
        self.assertFalse(self.monitor.is_goal_achieved())
        
        # Complete all tasks
        self.monitor.complete_task("task2")
        self.assertTrue(self.monitor.is_goal_achieved())

    def test_is_goal_achieved_empty(self):
        """Test goal achievement with no tasks."""
        self.assertFalse(self.monitor.is_goal_achieved())

    def test_get_status_report(self):
        """Test getting status report."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        self.monitor.update_progress("task1", 50.0, "Checkpoint")
        
        report = self.monitor.get_status_report()
        
        self.assertEqual(report["goal"], "Test Goal")
        self.assertEqual(report["overall_progress"], 50.0)
        self.assertFalse(report["goal_achieved"])
        self.assertIn("task1", report["tasks"])
        self.assertEqual(report["tasks"]["task1"]["name"], "Task 1")
        self.assertEqual(report["tasks"]["task1"]["status"], "in_progress")
        self.assertEqual(report["tasks"]["task1"]["progress"], 50.0)
        self.assertEqual(report["tasks"]["task1"]["checkpoints"], 1)

    def test_save_and_load_state(self):
        """Test saving and loading state."""
        # Add and update tasks
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        self.monitor.update_progress("task1", 50.0, "Checkpoint")
        
        # Create a new monitor with the same state file
        new_monitor = ProgressMonitor("", self.state_file)
        
        # Verify state was loaded
        self.assertEqual(new_monitor.goal, "Test Goal")
        self.assertIn("task1", new_monitor.tasks)
        
        task = new_monitor.tasks["task1"]
        self.assertEqual(task.name, "Task 1")
        self.assertEqual(task.status, TaskStatus.IN_PROGRESS)
        self.assertEqual(task.progress_percentage, 50.0)
        self.assertEqual(len(task.checkpoints), 1)

    def test_state_persistence(self):
        """Test that state persists across operations."""
        self.monitor.add_task("task1", "Task 1", "First task")
        
        # Verify file was created and contains data
        self.assertTrue(os.path.exists(self.state_file))
        
        with open(self.state_file, 'r') as f:
            state = json.load(f)
        
        self.assertEqual(state["goal"], "Test Goal")
        self.assertIn("task1", state["tasks"])

    def test_multiple_checkpoints(self):
        """Test multiple checkpoints for a task."""
        self.monitor.add_task("task1", "Task 1", "First task")
        self.monitor.start_task("task1")
        
        checkpoints = ["Checkpoint 1", "Checkpoint 2", "Checkpoint 3"]
        for i, cp in enumerate(checkpoints, 1):
            self.monitor.update_progress("task1", i * 25.0, cp)
        
        task = self.monitor.tasks["task1"]
        self.assertEqual(len(task.checkpoints), 3)
        
        for i, cp in enumerate(checkpoints):
            self.assertEqual(task.checkpoints[i]["name"], cp)

    def test_task_metadata(self):
        """Test task metadata functionality."""
        task = self.monitor.add_task("task1", "Task 1", "First task")
        
        # Initially empty
        self.assertEqual(len(task.metadata), 0)
        
        # Add metadata
        task.metadata["custom_field"] = "custom_value"
        self.monitor.save_state()
        
        # Load and verify
        new_monitor = ProgressMonitor("", self.state_file)
        loaded_task = new_monitor.tasks["task1"]
        self.assertEqual(loaded_task.metadata["custom_field"], "custom_value")


class TestTask(unittest.TestCase):
    """Test cases for Task class."""

    def test_task_creation(self):
        """Test creating a task."""
        task = Task(
            id="task1",
            name="Test Task",
            description="A test task"
        )
        
        self.assertEqual(task.id, "task1")
        self.assertEqual(task.name, "Test Task")
        self.assertEqual(task.description, "A test task")
        self.assertEqual(task.status, TaskStatus.PENDING)
        self.assertEqual(task.progress_percentage, 0.0)
        self.assertIsNone(task.started_at)
        self.assertIsNone(task.completed_at)
        self.assertEqual(len(task.checkpoints), 0)
        self.assertEqual(len(task.metadata), 0)

    def test_task_with_custom_status(self):
        """Test creating a task with custom status."""
        task = Task(
            id="task1",
            name="Test Task",
            description="A test task",
            status=TaskStatus.IN_PROGRESS
        )
        
        self.assertEqual(task.status, TaskStatus.IN_PROGRESS)


if __name__ == '__main__':
    unittest.main()
