#!/bin/bash
# Example usage script for the rooster.os autopilot system

echo "================================================"
echo "  Rooster.OS Auto-Auction System - Examples"
echo "================================================"
echo ""

# Create example directories
echo "Setting up example directories..."
mkdir -p /tmp/rooster_example/input
mkdir -p /tmp/rooster_example/output
echo "✓ Directories created"
echo ""

# Example 1: Show help
echo "Example 1: Display help information"
echo "-----------------------------------"
python3 scripts/autopilot_bot.py --help
echo ""
echo "Press Enter to continue..."
read

# Example 2: Explain configuration
echo ""
echo "Example 2: View configuration file"
echo "-----------------------------------"
echo "Configuration file location: config/autopilot-config.json"
echo ""
cat config/autopilot-config.json
echo ""
echo "Press Enter to continue..."
read

# Example 3: Show metadata example
echo ""
echo "Example 3: Sample metadata format"
echo "-----------------------------------"
echo "Metadata file location: examples/sample_metadata.json"
echo ""
cat examples/sample_metadata.json
echo ""
echo "Press Enter to continue..."
read

# Example 4: Individual bot help
echo ""
echo "Example 4: Individual bot usage"
echo "-----------------------------------"
echo ""
echo "Image Cropper Bot:"
python3 scripts/bots/image_cropper_bot.py --help
echo ""
echo ""
echo "Title Generator Bot:"
python3 scripts/bots/title_generator_bot.py --help
echo ""
echo ""
echo "Description Generator Bot:"
python3 scripts/bots/description_generator_bot.py --help
echo ""
echo "Press Enter to continue..."
read

# Example 5: Show workflow
echo ""
echo "Example 5: Typical Autopilot Workflow"
echo "-----------------------------------"
echo ""
echo "Step 1: Place your photos in an input directory"
echo "  Example: /tmp/rooster_example/input/"
echo ""
echo "Step 2: (Optional) Create metadata JSON file"
echo "  Example: examples/sample_metadata.json"
echo ""
echo "Step 3: Run the autopilot bot"
echo "  Command:"
echo "    python3 scripts/autopilot_bot.py --batch \\"
echo "      --metadata examples/sample_metadata.json \\"
echo "      /tmp/rooster_example/input/ \\"
echo "      /tmp/rooster_example/output/"
echo ""
echo "Step 4: Review generated outputs in output directory"
echo "  - Cropped images"
echo "  - Generated titles"
echo "  - Generated descriptions"
echo "  - Processing summary"
echo ""
echo "Step 5: Upload to your auction/marketplace platform"
echo ""

echo ""
echo "================================================"
echo "  Examples Complete!"
echo "================================================"
echo ""
echo "To run the autopilot bot yourself:"
echo "1. Add your images to a directory"
echo "2. Run: python3 scripts/autopilot_bot.py --batch input_dir/ output_dir/"
echo ""
