#!/usr/bin/env python3
"""
Title Generator Bot - Automatically generates compelling titles for auction listings.

This bot can:
- Analyze images to extract key information
- Generate SEO-optimized titles
- Follow customizable templates
- Include relevant keywords
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Optional, Dict
import argparse
import re


class TitleGeneratorBot:
    """Automated title generation bot for auction listings."""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the bot with configuration."""
        self.config = self._load_config(config_path)
        self.generated_count = 0
        
    def _load_config(self, config_path: Optional[str]) -> dict:
        """Load configuration from file or use defaults."""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                full_config = json.load(f)
                return full_config.get('title_generator', {})
        
        # Default configuration
        return {
            "enabled": True,
            "max_length": 80,
            "include_year": True,
            "include_condition": True,
            "templates": [
                "{year} {type} {denomination} {condition}",
                "{type} {denomination} - {year} - {condition}",
                "Vintage {year} {type} {denomination}"
            ]
        }
    
    def analyze_image(self, image_path: str) -> Dict[str, str]:
        """
        Analyze image to extract information for title generation.
        
        Args:
            image_path: Path to the image file
            
        Returns: Dictionary with extracted information
        
        Note: This is a placeholder for actual AI vision implementation.
        In production, this would use computer vision or AI models.
        """
        print(f"  Analyzing image: {os.path.basename(image_path)}")
        
        # Placeholder: In production, implement actual image analysis
        # For example using:
        # - OpenAI GPT-4 Vision API
        # - Google Cloud Vision API
        # - Custom trained models
        # - OCR for text on coins
        
        # Simulated extraction result
        # This would be replaced with actual AI analysis
        extracted_info = {
            'type': 'Silver Coin',
            'denomination': 'Dollar',
            'year': '1921',
            'condition': 'Fine',
            'mint_mark': 'S',
            'rarity': 'Common',
            'series': 'Morgan'
        }
        
        return extracted_info
    
    def generate_title(self, image_path: str, metadata: Optional[Dict] = None) -> str:
        """
        Generate a title for an auction listing.
        
        Args:
            image_path: Path to the image file
            metadata: Optional additional metadata to include
            
        Returns: Generated title string
        """
        if not self.config.get('enabled', True):
            return "Untitled Listing"
        
        # Analyze image to extract information
        info = self.analyze_image(image_path)
        
        # Merge with provided metadata
        if metadata:
            info.update(metadata)
        
        # Select template
        templates = self.config.get('templates', [])
        template = templates[0] if templates else "{year} {type} {denomination} {condition}"
        
        # Generate title from template
        try:
            title = template.format(**info)
        except KeyError as e:
            # Fallback if template has missing keys
            title = f"{info.get('year', '')} {info.get('type', '')} {info.get('denomination', '')} {info.get('condition', '')}"
        
        # Clean up multiple spaces
        title = re.sub(r'\s+', ' ', title).strip()
        
        # Ensure title doesn't exceed max length
        max_length = self.config.get('max_length', 80)
        if len(title) > max_length:
            title = title[:max_length-3] + '...'
        
        self.generated_count += 1
        return title
    
    def generate_batch(self, input_dir: str, output_file: str) -> dict:
        """
        Generate titles for all images in a directory.
        
        Args:
            input_dir: Directory containing images
            output_file: File to save generated titles (JSON format)
            
        Returns: Dictionary with generation statistics
        """
        print(f"\n{'='*60}")
        print(f"TITLE GENERATOR BOT - BATCH PROCESSING")
        print(f"{'='*60}")
        print(f"Input directory: {input_dir}")
        print(f"Output file: {output_file}")
        print(f"{'='*60}\n")
        
        # Supported image extensions
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        
        # Find all images
        input_path = Path(input_dir)
        image_files = [f for f in input_path.iterdir() 
                      if f.is_file() and f.suffix.lower() in image_extensions]
        
        if not image_files:
            print("No image files found in input directory.")
            return {'generated': 0, 'total': 0}
        
        print(f"Found {len(image_files)} images to process\n")
        
        # Generate titles
        results = {}
        for image_file in image_files:
            print(f"\nProcessing: {image_file.name}")
            title = self.generate_title(str(image_file))
            results[image_file.name] = title
            print(f"  Generated title: {title}")
        
        # Save results
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"TITLE GENERATION COMPLETE")
        print(f"{'='*60}")
        print(f"Generated: {self.generated_count}")
        print(f"Results saved to: {output_file}")
        print(f"{'='*60}\n")
        
        return {
            'generated': self.generated_count,
            'total': len(image_files)
        }
    
    def generate_from_metadata(self, metadata_file: str, output_file: str) -> dict:
        """
        Generate titles from a metadata file.
        
        Args:
            metadata_file: JSON file with metadata for each item
            output_file: File to save generated titles
            
        Returns: Dictionary with generation statistics
        """
        print(f"\n{'='*60}")
        print(f"TITLE GENERATOR BOT - FROM METADATA")
        print(f"{'='*60}")
        
        # Load metadata
        with open(metadata_file, 'r') as f:
            metadata_items = json.load(f)
        
        results = {}
        for item_id, metadata in metadata_items.items():
            # Get image path if available
            image_path = metadata.get('image_path', '')
            
            # Generate title
            print(f"\nGenerating title for: {item_id}")
            
            # Use metadata directly without image analysis
            templates = self.config.get('templates', [])
            template = templates[0] if templates else "{year} {type} {denomination} {condition}"
            
            try:
                title = template.format(**metadata)
            except KeyError as e:
                # Fallback if template has missing keys
                title = f"{metadata.get('year', '')} {metadata.get('type', '')} {metadata.get('denomination', '')}"
            
            title = re.sub(r'\s+', ' ', title).strip()
            
            max_length = self.config.get('max_length', 80)
            if len(title) > max_length:
                title = title[:max_length-3] + '...'
            
            results[item_id] = title
            print(f"  Title: {title}")
            self.generated_count += 1
        
        # Save results
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n{'='*60}")
        print(f"Results saved to: {output_file}")
        print(f"{'='*60}\n")
        
        return {
            'generated': self.generated_count,
            'total': len(metadata_items)
        }


def main():
    """Main entry point for the title generator bot."""
    parser = argparse.ArgumentParser(
        description='Title Generator Bot - Automatically generate auction listing titles'
    )
    parser.add_argument('input', help='Input image/directory or metadata file')
    parser.add_argument('output', help='Output file for generated titles (JSON)')
    parser.add_argument('--config', help='Path to config file', default=None)
    parser.add_argument('--batch', action='store_true', 
                       help='Process entire directory (batch mode)')
    parser.add_argument('--from-metadata', action='store_true',
                       help='Generate titles from metadata file')
    
    args = parser.parse_args()
    
    # Initialize bot
    bot = TitleGeneratorBot(config_path=args.config)
    
    # Generate titles
    if args.from_metadata:
        bot.generate_from_metadata(args.input, args.output)
    elif args.batch:
        bot.generate_batch(args.input, args.output)
    else:
        # Single image mode
        title = bot.generate_title(args.input)
        print(f"\nGenerated Title: {title}")
        
        # Save to file
        with open(args.output, 'w') as f:
            json.dump({args.input: title}, f, indent=2)


if __name__ == '__main__':
    main()
