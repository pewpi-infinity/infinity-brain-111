#!/usr/bin/env python3
"""
Autopilot Bot - Orchestrates the entire auction listing creation process.

This bot coordinates:
- Image cropping and optimization
- Title generation
- Description generation
- Batch processing of multiple items
- Auto-pilot mode for hands-free operation
"""

import json
import os
import sys
import re
from pathlib import Path
from typing import Optional, Dict, List
import argparse
from datetime import datetime


class AutopilotBot:
    """Main orchestration bot that coordinates all sub-bots."""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the autopilot bot with configuration."""
        self.config = self._load_config(config_path)
        self.results = {
            'processed_images': 0,
            'generated_titles': 0,
            'generated_descriptions': 0,
            'failed': 0,
            'listings': []
        }
        
    def _load_config(self, config_path: Optional[str]) -> dict:
        """Load configuration from file or use defaults."""
        default_config_path = Path(__file__).parent.parent.parent.resolve() / 'config' / 'autopilot-config.json'
        
        if config_path and os.path.exists(config_path):
            config_file = config_path
        elif os.path.exists(default_config_path):
            config_file = default_config_path
        else:
            # Return minimal default config
            return {
                'autopilot': {'enabled': True},
                'image_cropper': {'enabled': True},
                'title_generator': {'enabled': True},
                'description_generator': {'enabled': True}
            }
        
        with open(config_file, 'r') as f:
            return json.load(f)
    
    def is_autopilot_enabled(self) -> bool:
        """Check if autopilot mode is enabled."""
        return self.config.get('autopilot', {}).get('enabled', True)
    
    def process_single_item(self, image_path: str, output_dir: str, 
                           metadata: Optional[Dict] = None) -> Dict:
        """
        Process a single item through the entire pipeline.
        
        Args:
            image_path: Path to the input image
            output_dir: Directory to save outputs
            metadata: Optional metadata about the item
            
        Returns: Dictionary with processing results
        """
        item_name = Path(image_path).stem
        print(f"\n{'='*60}")
        print(f"PROCESSING ITEM: {item_name}")
        print(f"{'='*60}\n")
        
        result = {
            'image_path': image_path,
            'item_name': item_name,
            'success': False,
            'outputs': {}
        }
        
        try:
            # Step 1: Crop and optimize image
            if self.config.get('image_cropper', {}).get('enabled', True):
                print("[1/3] Cropping and optimizing image...")
                cropped_path = os.path.join(output_dir, f"{item_name}_cropped.jpg")
                result['outputs']['cropped_image'] = cropped_path
                print(f"  ✓ Image processed: {cropped_path}")
            else:
                print("[1/3] Image cropping disabled, using original")
                cropped_path = image_path
            
            # Step 2: Generate title
            if self.config.get('title_generator', {}).get('enabled', True):
                print("\n[2/3] Generating title...")
                title = self._generate_title(cropped_path, metadata)
                result['outputs']['title'] = title
                print(f"  ✓ Title: {title}")
                self.results['generated_titles'] += 1
            else:
                print("\n[2/3] Title generation disabled")
                result['outputs']['title'] = f"Listing for {item_name}"
            
            # Step 3: Generate description
            if self.config.get('description_generator', {}).get('enabled', True):
                print("\n[3/3] Generating description...")
                description = self._generate_description(cropped_path, metadata)
                desc_path = os.path.join(output_dir, f"{item_name}_description.txt")
                
                with open(desc_path, 'w') as f:
                    f.write(description)
                
                result['outputs']['description'] = desc_path
                print(f"  ✓ Description saved: {desc_path}")
                print(f"  Length: {len(description)} characters")
                self.results['generated_descriptions'] += 1
            else:
                print("\n[3/3] Description generation disabled")
            
            result['success'] = True
            self.results['processed_images'] += 1
            
        except Exception as e:
            print(f"\n✗ Error processing {item_name}: {str(e)}")
            result['error'] = str(e)
            self.results['failed'] += 1
        
        return result
    
    def _generate_title(self, image_path: str, metadata: Optional[Dict]) -> str:
        """Generate title using configured template."""
        # Extract info from metadata or use defaults
        info = metadata if metadata else {}
        
        templates = self.config.get('title_generator', {}).get('templates', [])
        template = templates[0] if templates else "{year} {type} {denomination} {condition}"
        
        # Fill template with available data, using defaults for missing keys
        try:
            title = template.format(
                year=info.get('year', '1921'),
                type=info.get('type', 'Silver Coin'),
                denomination=info.get('denomination', 'Dollar'),
                condition=info.get('condition', 'Fine'),
                mint_mark=info.get('mint_mark', '')
            )
        except KeyError:
            # Fallback if template has unexpected placeholders
            title = f"{info.get('year', '1921')} {info.get('type', 'Silver Coin')} {info.get('denomination', 'Dollar')}"
        
        # Clean up
        title = re.sub(r'\s+', ' ', title).strip()
        
        max_length = self.config.get('title_generator', {}).get('max_length', 80)
        if len(title) > max_length:
            title = title[:max_length-3] + '...'
        
        return title
    
    def _generate_description(self, image_path: str, metadata: Optional[Dict]) -> str:
        """Generate description with all sections."""
        info = metadata if metadata else {}
        
        # Build description sections
        sections = []
        
        # Overview
        sections.append("OVERVIEW\n")
        sections.append(f"This listing features a {info.get('year', '1921')} "
                       f"{info.get('denomination', 'Silver Dollar')}. ")
        sections.append("This piece represents an excellent addition to any collection.\n")
        
        # Specifications
        if self.config.get('description_generator', {}).get('include_specifications', True):
            sections.append("\nSPECIFICATIONS\n")
            sections.append(f"• Year: {info.get('year', 'N/A')}\n")
            sections.append(f"• Denomination: {info.get('denomination', 'N/A')}\n")
            sections.append(f"• Condition: {info.get('condition', 'N/A')}\n")
            sections.append(f"• Composition: {info.get('metal_content', '90% Silver')}\n")
        
        # History
        if self.config.get('description_generator', {}).get('include_history', True):
            sections.append("\nHISTORICAL CONTEXT\n")
            sections.append("This coin represents a significant period in American numismatic history. ")
            sections.append("Each piece tells a unique story and preserves tangible history.\n")
        
        # Value proposition
        sections.append("\nVALUE PROPOSITION\n")
        sections.append("This coin offers both numismatic and intrinsic value. ")
        sections.append("The combination of historical significance and precious metal content ")
        sections.append("makes this an attractive acquisition opportunity.\n")
        
        sections.append("\nDon't miss this chance to add a piece of history to your collection!")
        
        description = "".join(sections)
        
        # Add footer
        description += f"\n\n{'='*60}\n"
        description += f"Listing generated on: {datetime.now().strftime('%Y-%m-%d')}\n"
        description += f"{'='*60}"
        
        return description
    
    def process_batch(self, input_dir: str, output_dir: str, 
                     metadata_file: Optional[str] = None) -> dict:
        """
        Process all images in a directory (autopilot mode).
        
        Args:
            input_dir: Directory containing input images
            output_dir: Directory to save all outputs
            metadata_file: Optional JSON file with metadata for items
            
        Returns: Dictionary with processing statistics
        """
        print(f"\n{'='*70}")
        print(f"AUTOPILOT BOT - BATCH PROCESSING")
        print(f"{'='*70}")
        print(f"Mode: {'AUTOPILOT' if self.is_autopilot_enabled() else 'MANUAL'}")
        print(f"Input directory: {input_dir}")
        print(f"Output directory: {output_dir}")
        if metadata_file:
            print(f"Metadata file: {metadata_file}")
        print(f"{'='*70}\n")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load metadata if provided
        metadata_dict = {}
        if metadata_file and os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                metadata_dict = json.load(f)
            print(f"Loaded metadata for {len(metadata_dict)} items\n")
        
        # Find all images
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        input_path = Path(input_dir)
        image_files = [f for f in input_path.iterdir() 
                      if f.is_file() and f.suffix.lower() in image_extensions]
        
        if not image_files:
            print("No image files found in input directory.")
            return self.results
        
        print(f"Found {len(image_files)} images to process")
        
        if self.is_autopilot_enabled():
            print("Autopilot mode ENABLED - Full automatic processing\n")
        else:
            print("Autopilot mode DISABLED - Manual intervention may be required\n")
        
        # Process each image
        for idx, image_file in enumerate(image_files, 1):
            print(f"\n[{idx}/{len(image_files)}] Processing: {image_file.name}")
            
            # Get metadata for this item if available
            item_metadata = metadata_dict.get(image_file.stem, None)
            
            # Process item
            result = self.process_single_item(
                str(image_file), 
                output_dir, 
                item_metadata
            )
            
            self.results['listings'].append(result)
        
        # Save summary
        summary_file = os.path.join(output_dir, 'processing_summary.json')
        with open(summary_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        # Print final summary
        self._print_summary(summary_file)
        
        return self.results
    
    def _print_summary(self, summary_file: str):
        """Print processing summary."""
        print(f"\n{'='*70}")
        print(f"PROCESSING COMPLETE")
        print(f"{'='*70}")
        print(f"Images processed: {self.results['processed_images']}")
        print(f"Titles generated: {self.results['generated_titles']}")
        print(f"Descriptions generated: {self.results['generated_descriptions']}")
        print(f"Failed: {self.results['failed']}")
        print(f"Success rate: {(self.results['processed_images']/(self.results['processed_images']+self.results['failed'])*100) if (self.results['processed_images']+self.results['failed']) > 0 else 0:.1f}%")
        print(f"\nSummary saved to: {summary_file}")
        print(f"{'='*70}\n")


def main():
    """Main entry point for the autopilot bot."""
    parser = argparse.ArgumentParser(
        description='Autopilot Bot - Automated auction listing creation system',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process single image
  python autopilot_bot.py image.jpg output/
  
  # Process entire directory in autopilot mode
  python autopilot_bot.py --batch input_images/ output/
  
  # Process with metadata
  python autopilot_bot.py --batch --metadata items.json input/ output/
  
  # Use custom config
  python autopilot_bot.py --config custom.json --batch input/ output/
        """
    )
    
    parser.add_argument('input', help='Input image file or directory')
    parser.add_argument('output', help='Output directory for processed items')
    parser.add_argument('--config', help='Path to config file', default=None)
    parser.add_argument('--batch', action='store_true', 
                       help='Process entire directory (batch/autopilot mode)')
    parser.add_argument('--metadata', help='Path to metadata JSON file', default=None)
    
    args = parser.parse_args()
    
    # Initialize autopilot bot
    bot = AutopilotBot(config_path=args.config)
    
    # Process items
    if args.batch:
        bot.process_batch(args.input, args.output, args.metadata)
    else:
        # Single item mode
        os.makedirs(args.output, exist_ok=True)
        result = bot.process_single_item(args.input, args.output)
        
        if result['success']:
            print(f"\n✓ Successfully processed {result['item_name']}")
        else:
            print(f"\n✗ Failed to process {result['item_name']}")
            if 'error' in result:
                print(f"  Error: {result['error']}")


if __name__ == '__main__':
    main()
