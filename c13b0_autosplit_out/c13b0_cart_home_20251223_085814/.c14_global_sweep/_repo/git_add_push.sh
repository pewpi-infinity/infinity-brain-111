#!/bin/bash
# [∞] Quick git add/commit/push for mongoose.os

DATESTAMP=$(date +"%Y-%m-%d_%H:%M:%S")
git add .
git status
git commit -m "[∞] Auto-commit: $DATESTAMP"
git push origin main
