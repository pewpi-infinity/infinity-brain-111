#!/usr/bin/env python3
"""
Orchestrator for the pipeline:
- Accepts an input directory (or decodes an archive provided by the workflow)
- Runs the Gutenberg scraper (placeholder)
- Builds a simple conversation model (TF-IDF)
- Calls Octave processing if present
- Uses repo logger for logs (if available)
"""
import argparse
import os
import subprocess
import sys
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))

def run_scraper(output_dir):
    from scripts.scrape_gutenberg import fetch_sample_texts
    fetch_sample_texts(output_dir)

def build_model(text_dir, out_dir):
    from scripts.build_conversation_model import build_and_save_model
    build_and_save_model(text_dir, out_dir)

def run_octave_if_exists():
    # If you have octave scripts you want to run, call them here.
    # Example: if run_octave_logged.py is present, invoke it.
    octave_script = os.path.join(os.path.dirname(HERE), "run_octave_logged.py")
    if os.path.exists(octave_script):
        print("Running Octave integration script:", octave_script)
        subprocess.check_call([sys.executable, octave_script])

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", help="Directory with files to process (optional).", default=None)
    parser.add_argument("--workdir", help="Work directory to write outputs", default="pipeline_out")
    args = parser.parse_args()

    workdir = os.path.abspath(args.workdir)
    os.makedirs(workdir, exist_ok=True)
    print("Workdir:", workdir)

    input_dir = args.input_dir
    if input_dir:
        input_dir = os.path.abspath(input_dir)
        print("Using input dir:", input_dir)
    else:
        # if no input-dir, create a folder for scraped content
        input_dir = os.path.join(workdir, "scraped")
        os.makedirs(input_dir, exist_ok=True)
        print("No input-dir provided; will scrape Gutenberg into:", input_dir)
        run_scraper(input_dir)

    # Build conversational model from texts
    model_out = os.path.join(workdir, "model")
    os.makedirs(model_out, exist_ok=True)
    build_model(input_dir, model_out)
    print("Model saved to:", model_out)

    # Run Octave integration if present (optional)
    try:
        run_octave_if_exists()
    except subprocess.CalledProcessError as e:
        print("Octave step failed:", e)

    print("Pipeline completed.")
    print("You can inspect outputs in:", workdir)

if __name__ == "__main__":
    main()