#!/usr/bin/env python3
"""
Test script for the logged Octave shell implementation.
Tests the logging functionality without requiring Octave to be installed.
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path
import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from run_octave_logged import ensure_log_dir, format_timestamp, log_message


def test_log_directory_creation():
    """Test that log directory is created correctly."""
    print("Testing log directory creation...")
    
    # Change to temp directory
    original_dir = os.getcwd()
    temp_dir = tempfile.mkdtemp()
    
    try:
        os.chdir(temp_dir)
        log_file = ensure_log_dir()
        
        assert Path("logs").exists(), "logs directory should exist"
        assert log_file == Path("logs/txt.log"), "log file path should be logs/txt.log"
        print("✓ Log directory creation works")
        
    finally:
        os.chdir(original_dir)
        shutil.rmtree(temp_dir)


def test_timestamp_format():
    """Test timestamp formatting."""
    print("Testing timestamp format...")
    
    timestamp = format_timestamp()
    
    # Check format [YYYY-MM-DD HH:MM:SS]
    assert timestamp.startswith("["), "Timestamp should start with ["
    assert timestamp.endswith("]"), "Timestamp should end with ]"
    assert len(timestamp) == 21, "Timestamp should be 21 characters"
    
    # Verify it contains valid date/time
    current_year = datetime.datetime.now().year
    assert str(current_year) in timestamp, "Timestamp should contain current year"
    
    print(f"✓ Timestamp format works: {timestamp}")


def test_log_message_writing():
    """Test writing log messages."""
    print("Testing log message writing...")
    
    original_dir = os.getcwd()
    temp_dir = tempfile.mkdtemp()
    
    try:
        os.chdir(temp_dir)
        log_file = ensure_log_dir()
        
        # Log some test messages
        log_message(log_file, "IN", "x = 5")
        log_message(log_file, "OUT", "x = 5")
        log_message(log_file, "IN", "y = x * 2")
        log_message(log_file, "OUT", "y = 10")
        
        # Read and verify
        with open(log_file, 'r') as f:
            content = f.read()
        
        lines = content.strip().split('\n')
        assert len(lines) == 4, f"Should have 4 log lines, got {len(lines)}"
        
        # Verify format
        assert "[IN]" in lines[0], "First line should be input"
        assert "x = 5" in lines[0], "First line should contain 'x = 5'"
        assert "[OUT]" in lines[1], "Second line should be output"
        assert "[IN]" in lines[2], "Third line should be input"
        assert "[OUT]" in lines[3], "Fourth line should be output"
        assert "y = 10" in lines[3], "Fourth line should contain 'y = 10'"
        
        print("✓ Log message writing works")
        print(f"  Sample log line: {lines[0]}")
        
    finally:
        os.chdir(original_dir)
        shutil.rmtree(temp_dir)


def test_log_file_structure():
    """Test that log files maintain proper structure."""
    print("Testing log file structure...")
    
    original_dir = os.getcwd()
    temp_dir = tempfile.mkdtemp()
    
    try:
        os.chdir(temp_dir)
        log_file = ensure_log_dir()
        
        # Create various log entries
        test_entries = [
            ("IN", "format compact"),
            ("OUT", ""),
            ("IN", "A = [1 2 3; 4 5 6; 7 8 9]"),
            ("OUT", "A ="),
            ("OUT", "   1   2   3"),
            ("OUT", "   4   5   6"),
            ("OUT", "   7   8   9"),
            ("IN", "det(A)"),
            ("OUT", "ans = 0"),
        ]
        
        for direction, message in test_entries:
            log_message(log_file, direction, message)
        
        # Verify structure
        with open(log_file, 'r') as f:
            content = f.read()
        
        lines = content.strip().split('\n')
        assert len(lines) == len(test_entries), "All entries should be logged"
        
        # Verify each line has timestamp
        for line in lines:
            assert line.startswith("["), "Each line should start with timestamp"
            assert "[IN]" in line or "[OUT]" in line, "Each line should have direction"
        
        print("✓ Log file structure is correct")
        
    finally:
        os.chdir(original_dir)
        shutil.rmtree(temp_dir)


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("Running tests for logged Octave shell")
    print("=" * 60)
    print()
    
    tests = [
        test_log_directory_creation,
        test_timestamp_format,
        test_log_message_writing,
        test_log_file_structure,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
            print()
        except AssertionError as e:
            print(f"✗ Test failed: {e}")
            failed += 1
            print()
        except Exception as e:
            print(f"✗ Test error: {e}")
            failed += 1
            print()
    
    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
