#!/usr/bin/env python3

from collections import Counter

def recurrence(cells):
    counts = Counter(cells)
    return {
        "recurring_cells": counts.most_common(10),
        "unique_cells": len(counts)
    }

if __name__ == "__main__":
    print(recurrence([120,120,118,120,130,118,120]))
