#!/usr/bin/env python3

from collections import Counter

def recurrence(windows):
    counts = Counter(windows)
    common = counts.most_common(10)
    return {
        "recurring_patterns": common,
        "unique_patterns": len(counts)
    }

if __name__ == "__main__":
    sample = [10,10,12,10,15,12,10,15,15]
    print(recurrence(sample))
