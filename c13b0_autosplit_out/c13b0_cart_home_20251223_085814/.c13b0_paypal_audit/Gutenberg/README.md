# Gutenberg

## Progress Monitor System

A robust progress monitoring system designed to help you **keep an eye on the prize** and ensure that automated processes (like ChatGPT or other AI systems) **don't fail partway through** tasks.

### Features

✅ **Goal-Oriented Tracking** - Define clear goals and track progress towards them  
✅ **Task Management** - Break down goals into manageable tasks  
✅ **Progress Monitoring** - Real-time progress updates with percentage tracking  
✅ **Checkpoint System** - Create recovery points to prevent data loss  
✅ **Failure Recovery** - Automatically recover from the last checkpoint when failures occur  
✅ **State Persistence** - All progress is saved to disk and survives restarts  
✅ **CLI Interface** - Easy-to-use command-line tool  
✅ **Programmatic API** - Python library for integration into your projects  

### Installation

No installation required! Just use the Python files directly:

```bash
# Clone or download the repository
git clone https://github.com/pewpi-infinity/Gutenberg.git
cd Gutenberg

# Make the CLI executable (optional)
chmod +x progress_cli.py
```

### Quick Start

#### Using the CLI

```bash
# 1. Create a new progress monitor with a goal
python3 progress_cli.py create --goal "Complete the project without failing"

# 2. Add tasks
python3 progress_cli.py add-task --task-id task1 --name "Design" --description "Create designs"
python3 progress_cli.py add-task --task-id task2 --name "Implement" --description "Write code"
python3 progress_cli.py add-task --task-id task3 --name "Test" --description "Run tests"

# 3. Start working on tasks
python3 progress_cli.py start --task-id task1

# 4. Update progress with checkpoints
python3 progress_cli.py update --task-id task1 --percentage 50 --checkpoint "Mockups complete"
python3 progress_cli.py update --task-id task1 --percentage 100

# 5. Complete the task
python3 progress_cli.py complete --task-id task1

# 6. Check status anytime
python3 progress_cli.py status
```

#### Handling Failures

The system is designed to handle failures gracefully:

```bash
# If a task fails
python3 progress_cli.py fail --task-id task2 --reason "Connection timeout"

# Recover from the last checkpoint
python3 progress_cli.py recover --task-id task2

# Continue from where you left off
python3 progress_cli.py update --task-id task2 --percentage 100
python3 progress_cli.py complete --task-id task2
```

#### Using the Python API

```python
from progress_monitor import ProgressMonitor

# Create a monitor
monitor = ProgressMonitor("Complete the Gutenberg project")

# Add tasks
monitor.add_task("design", "Design System", "Create the design system")
monitor.add_task("implement", "Implementation", "Implement core features")

# Work on tasks
monitor.start_task("design")
monitor.update_progress("design", 50, "Initial mockups done")
monitor.update_progress("design", 100, "Final designs approved")
monitor.complete_task("design")

# Handle failures
monitor.start_task("implement")
monitor.update_progress("implement", 60, "API integration complete")
monitor.fail_task("implement", "Connection lost")

# Recover and continue
checkpoint = monitor.recover_task("implement")
print(f"Recovered from: {checkpoint['name']} at {checkpoint['progress']}%")

monitor.update_progress("implement", 100)
monitor.complete_task("implement")

# Check if goal is achieved
if monitor.is_goal_achieved():
    print("🎉 Goal achieved!")

# Print status
monitor.print_status()
```

### Example Output

```
============================================================
Goal: Don't let ChatGPT fail partway through
============================================================
Overall Progress: 100.0%
Goal Achieved: True

Tasks:
  ✅ [100.0%] Analysis
      Status: completed
      Checkpoints: 1
  ✅ [100.0%] Implementation
      Status: completed
      Checkpoints: 2
  ✅ [100.0%] Verification
      Status: completed
============================================================

🎉 CONGRATULATIONS! Goal achieved! All tasks completed! 🎉
```

### Architecture

The system consists of three main components:

1. **`progress_monitor.py`** - Core library with `ProgressMonitor` and `Task` classes
2. **`progress_cli.py`** - Command-line interface for easy interaction
3. **`test_progress_monitor.py`** - Comprehensive test suite

### State Persistence

All progress is automatically saved to a JSON file (default: `progress_state.json`). This means:
- Progress survives system crashes and restarts
- You can share progress with team members
- You can backup and restore your progress
- Multiple monitors can use different state files

### Use Cases

- **AI Task Monitoring** - Ensure ChatGPT/AI agents complete tasks fully
- **Long-Running Processes** - Track progress of builds, deployments, data processing
- **Project Management** - Break down projects into trackable tasks
- **Automated Workflows** - Add checkpoints to prevent partial failures
- **Team Collaboration** - Share progress state across team members

### Testing

Run the comprehensive test suite:

```bash
python3 -m unittest test_progress_monitor.py -v
```

All 22 tests should pass, covering:
- Task creation and management
- Progress tracking and updates
- Checkpoint creation and recovery
- State persistence and loading
- Error handling
- Goal achievement detection

### Requirements

- Python 3.6 or higher
- No external dependencies (uses only standard library)

### License

Open source - feel free to use and modify as needed.

### Contributing

Contributions welcome! This system is designed to be simple and focused on preventing partial failures through checkpoints and state persistence.