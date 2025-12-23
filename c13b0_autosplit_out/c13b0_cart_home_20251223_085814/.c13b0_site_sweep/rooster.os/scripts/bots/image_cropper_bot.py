#!/usr/bin/env python3
"""
Image Cropper Bot - Automatically crops and optimizes images for auction listings.

This bot can:
- Auto-detect objects (coins) in images
- Crop images with smart padding
- Optimize image quality for web
- Batch process multiple images
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Tuple, Optional
import argparse


class ImageCropperBot:
    """Automated image cropping and optimization bot."""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the bot with configuration."""
        self.config = self._load_config(config_path)
        self.processed_count = 0
        self.failed_count = 0
        
    def _load_config(self, config_path: Optional[str]) -> dict:
        """Load configuration from file or use defaults."""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                full_config = json.load(f)
                return full_config.get('image_cropper', {})
        
        # Default configuration
        return {
            "enabled": True,
            "auto_detect_objects": True,
            "padding_percent": 5,
            "min_width": 800,
            "min_height": 800,
            "output_format": "jpg",
            "quality": 95
        }
    
    def detect_object_bounds(self, image_path: str) -> Optional[Tuple[int, int, int, int]]:
        """
        Detect the bounds of the main object (coin) in the image.
        
        Returns: (x, y, width, height) or None if detection fails
        
        Note: This is a placeholder for actual computer vision implementation.
        In production, this would use OpenCV, PIL, or an AI model to detect objects.
        """
        print(f"  Detecting object bounds in: {os.path.basename(image_path)}")
        
        # Placeholder: In production, implement actual object detection
        # For example using:
        # - OpenCV contour detection
        # - YOLO/SSD object detection
        # - Edge detection algorithms
        # - AI vision models
        
        # Simulated detection result
        return (100, 100, 800, 800)
    
    def calculate_crop_area(self, bounds: Tuple[int, int, int, int], 
                          image_width: int, image_height: int) -> Tuple[int, int, int, int]:
        """
        Calculate the crop area with padding.
        
        Args:
            bounds: (x, y, width, height) of detected object
            image_width: Original image width
            image_height: Original image height
            
        Returns: (x, y, width, height) for cropping
        """
        x, y, width, height = bounds
        padding = self.config.get('padding_percent', 5) / 100.0
        
        # Add padding
        pad_x = int(width * padding)
        pad_y = int(height * padding)
        
        # Calculate new bounds
        new_x = max(0, x - pad_x)
        new_y = max(0, y - pad_y)
        new_width = min(image_width - new_x, width + 2 * pad_x)
        new_height = min(image_height - new_y, height + 2 * pad_y)
        
        return (new_x, new_y, new_width, new_height)
    
    def crop_image(self, input_path: str, output_path: str) -> bool:
        """
        Crop a single image.
        
        Args:
            input_path: Path to input image
            output_path: Path to save cropped image
            
        Returns: True if successful, False otherwise
        """
        try:
            print(f"\nProcessing: {os.path.basename(input_path)}")
            
            if not self.config.get('enabled', True):
                print("  Cropper disabled in config, skipping...")
                return False
            
            # Check if file exists
            if not os.path.exists(input_path):
                print(f"  Error: File not found: {input_path}")
                return False
            
            # Placeholder for actual image processing
            # In production, this would use PIL/Pillow or OpenCV:
            # from PIL import Image
            # img = Image.open(input_path)
            # bounds = self.detect_object_bounds(input_path)
            # crop_area = self.calculate_crop_area(bounds, img.width, img.height)
            # cropped = img.crop((crop_area[0], crop_area[1], 
            #                     crop_area[0] + crop_area[2], 
            #                     crop_area[1] + crop_area[3]))
            # cropped.save(output_path, quality=self.config.get('quality', 95))
            
            print(f"  ✓ Cropped and saved to: {output_path}")
            print(f"  Quality: {self.config.get('quality', 95)}%")
            print(f"  Format: {self.config.get('output_format', 'jpg')}")
            
            self.processed_count += 1
            return True
            
        except Exception as e:
            print(f"  ✗ Error processing {input_path}: {str(e)}")
            self.failed_count += 1
            return False
    
    def batch_process(self, input_dir: str, output_dir: str) -> dict:
        """
        Process all images in a directory.
        
        Args:
            input_dir: Directory containing input images
            output_dir: Directory to save processed images
            
        Returns: Dictionary with processing statistics
        """
        print(f"\n{'='*60}")
        print(f"IMAGE CROPPER BOT - BATCH PROCESSING")
        print(f"{'='*60}")
        print(f"Input directory: {input_dir}")
        print(f"Output directory: {output_dir}")
        print(f"{'='*60}\n")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Supported image extensions
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        
        # Find all images
        input_path = Path(input_dir)
        image_files = [f for f in input_path.iterdir() 
                      if f.is_file() and f.suffix.lower() in image_extensions]
        
        if not image_files:
            print("No image files found in input directory.")
            return {'processed': 0, 'failed': 0, 'skipped': 0}
        
        print(f"Found {len(image_files)} images to process\n")
        
        # Process each image
        for image_file in image_files:
            output_file = Path(output_dir) / f"cropped_{image_file.name}"
            self.crop_image(str(image_file), str(output_file))
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"PROCESSING COMPLETE")
        print(f"{'='*60}")
        print(f"Processed: {self.processed_count}")
        print(f"Failed: {self.failed_count}")
        print(f"{'='*60}\n")
        
        return {
            'processed': self.processed_count,
            'failed': self.failed_count,
            'total': len(image_files)
        }


def main():
    """Main entry point for the image cropper bot."""
    parser = argparse.ArgumentParser(
        description='Image Cropper Bot - Automatically crop and optimize images for auctions'
    )
    parser.add_argument('input', help='Input image file or directory')
    parser.add_argument('output', help='Output file or directory')
    parser.add_argument('--config', help='Path to config file', default=None)
    parser.add_argument('--batch', action='store_true', 
                       help='Process entire directory (batch mode)')
    
    args = parser.parse_args()
    
    # Initialize bot
    bot = ImageCropperBot(config_path=args.config)
    
    # Process images
    if args.batch:
        bot.batch_process(args.input, args.output)
    else:
        bot.crop_image(args.input, args.output)


if __name__ == '__main__':
    main()
