#!/usr/bin/env python3
"""
Resort 360 — NuGen Domain Data Preparation & Validation Script

This script processes, normalizes, and strictly validates all files in data/nugen
according to NuGen's alignment standards:
1. Valid JSON / JSONL syntax with zero trailing commas
2. Strict UTF-8 encoding (no BOM, no corrupt characters)
3. Exactly ONE JSON object per line in .jsonl files (no empty lines, no multiple objects per line)
4. Clean, valid formatting in .json array files
5. Clear separation between DATASET and BENCHMARK

Outputs:
  - data/nugen/dataset.jsonl   (Training Dataset - JSON Lines)
  - data/nugen/dataset.json    (Training Dataset - JSON Array)
  - data/nugen/benchmark.jsonl (Evaluation Benchmark - JSON Lines)
  - data/nugen/benchmark.json  (Evaluation Benchmark - JSON Array)
"""

import os
import json
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NUGEN_DIR = os.path.join(BASE_DIR, "data", "nugen")

def load_json_or_jsonl(filepath):
    """Load records from either JSON array or JSONL file."""
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read().strip()
    
    if not content:
        return []
    
    # Try parsing as JSON array
    if content.startswith("[") and content.endswith("]"):
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass
    
    # Parse as JSON Lines
    records = []
    for line_num, line in enumerate(content.splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError as e:
            print(f"Warning: JSON parse error in {filepath} line {line_num}: {e}")
    return records

def write_strict_jsonl(filepath, records):
    """
    Write records to a strict JSON Lines file:
    - Exactly 1 JSON object per line
    - No empty lines between objects
    - Strict UTF-8 encoding
    - Valid JSON syntax without trailing commas or extraneous whitespace
    """
    with open(filepath, "w", encoding="utf-8", newline="\n") as f:
        for idx, rec in enumerate(records):
            # Dump compact single-line JSON
            json_str = json.dumps(rec, ensure_ascii=False, separators=(',', ':'))
            f.write(json_str)
            if idx < len(records) - 1:
                f.write("\n")
    print(f"  [OK] Written {len(records)} objects -> {filepath}")

def write_strict_json_array(filepath, records):
    """
    Write records to a strict JSON array file:
    - Valid standard JSON array: [{...}, {...}]
    - No trailing commas
    - 2-space clean indentation
    - Strict UTF-8 encoding
    """
    with open(filepath, "w", encoding="utf-8", newline="\n") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"  [OK] Written {len(records)} objects -> {filepath}")

def validate_file(filepath, is_jsonl=True):
    """Validate that the written file is 100% valid syntax with no empty lines."""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    if is_jsonl:
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped:
                raise ValueError(f"Empty line detected in JSONL at line {i+1} in {filepath}")
            # Ensure line parses as valid JSON object
            parsed = json.loads(stripped)
            if not isinstance(parsed, dict):
                raise ValueError(f"Line {i+1} in {filepath} is not a valid JSON dict")
        print(f"  [VALIDATED] {filepath} is valid JSONL with {len(lines)} non-empty lines.")
    else:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, list):
            raise ValueError(f"{filepath} is not a JSON list")
        print(f"  [VALIDATED] {filepath} is valid JSON Array with {len(data)} items.")

def main():
    print("=" * 70)
    print(" RESORT 360 — NUGEN DATASET & BENCHMARK PREPARATION")
    print("=" * 70)

    # 1. Prepare Training Dataset
    # Source: resort360-alignment-scenarios.jsonl (or resort360-domain-scenarios.jsonl)
    dataset_source = os.path.join(NUGEN_DIR, "resort360-alignment-scenarios.jsonl")
    dataset_records = load_json_or_jsonl(dataset_source)
    print(f"\nLoaded {len(dataset_records)} training records from {os.path.basename(dataset_source)}")

    target_dataset_jsonl = os.path.join(NUGEN_DIR, "dataset.jsonl")
    target_dataset_json = os.path.join(NUGEN_DIR, "dataset.json")

    print("\nWriting Training Dataset:")
    write_strict_jsonl(target_dataset_jsonl, dataset_records)
    write_strict_json_array(target_dataset_json, dataset_records)
    validate_file(target_dataset_jsonl, is_jsonl=True)
    validate_file(target_dataset_json, is_jsonl=False)

    # 2. Prepare Evaluation Benchmark
    # Source: resort360-benchmark.json (or resort360-benchmark.jsonl)
    benchmark_source = os.path.join(NUGEN_DIR, "resort360-benchmark.json")
    benchmark_records = load_json_or_jsonl(benchmark_source)
    print(f"\nLoaded {len(benchmark_records)} benchmark records from {os.path.basename(benchmark_source)}")

    target_benchmark_jsonl = os.path.join(NUGEN_DIR, "benchmark.jsonl")
    target_benchmark_json = os.path.join(NUGEN_DIR, "benchmark.json")

    print("\nWriting Evaluation Benchmark:")
    write_strict_jsonl(target_benchmark_jsonl, benchmark_records)
    write_strict_json_array(target_benchmark_json, benchmark_records)
    validate_file(target_benchmark_jsonl, is_jsonl=True)
    validate_file(target_benchmark_json, is_jsonl=False)

    print("\n" + "=" * 70)
    print(" SUMMARY OF FILES FOR NUGEN ALIGNMENT")
    print("=" * 70)
    print("1. DOMAIN CONTEXT DOCUMENT:")
    print("   -> data/nugen/RESORT360_NUGEN_DOMAIN_CONTEXT.md (or .txt)")
    print("   (Upload to: 'Domain Documents' / 'Context of Domain')")
    print("\n2. TRAINING DATASET:")
    print("   -> data/nugen/dataset.jsonl (or dataset.json)")
    print("   (Upload to: 'Dataset' / 'Training Scenarios')")
    print("\n3. EVALUATION BENCHMARK:")
    print("   -> data/nugen/benchmark.json (or benchmark.jsonl)")
    print("   (Upload to: 'Benchmark' / 'Evaluation Test Set')")
    print("=" * 70)

if __name__ == "__main__":
    main()
