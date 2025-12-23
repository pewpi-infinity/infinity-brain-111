# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Your Images
```bash
# Create a folder for your photos
mkdir my_coin_photos

# Add your photos to this folder (JPG, PNG, etc.)
# For example, copy all coin photos from your phone to this folder
```

### Step 2: (Optional) Create Metadata
If you want better results, create a metadata file with details about your items:

```bash
# Copy the example metadata file
cp examples/sample_metadata.json my_metadata.json

# Edit it with your item details
nano my_metadata.json
```

Example metadata structure:
```json
{
  "photo1": {
    "year": "1921",
    "type": "Silver Coin",
    "denomination": "Morgan Dollar",
    "condition": "Fine"
  }
}
```

### Step 3: Run Autopilot
```bash
# Process all photos automatically
python3 scripts/autopilot_bot.py --batch my_coin_photos/ output/

# Or with metadata for better results:
python3 scripts/autopilot_bot.py --batch --metadata my_metadata.json my_coin_photos/ output/
```

That's it! Check the `output/` folder for:
- ✅ Cropped images
- ✅ Generated titles
- ✅ Complete descriptions
- ✅ Processing summary

## 📱 Real-World Example: Selling 1000 Silver Coins

### The Problem
You have 1000 silver coin photos on your phone and want to list them for auction, but:
- Writing 1000 descriptions takes weeks
- Creating good titles is tedious
- Photos need cropping and optimization
- You want consistent, professional listings

### The Solution
```bash
# 1. Transfer all photos from phone to computer
# Put them in: coin_collection/

# 2. Run the autopilot bot
python3 scripts/autopilot_bot.py --batch coin_collection/ listings_output/

# 3. Wait a few minutes while it processes everything

# 4. Review the output:
#    - 1000 cropped images
#    - 1000 SEO-optimized titles
#    - 1000 detailed descriptions
#    - Complete processing summary
```

### Time Savings
- **Manual approach**: 10-15 minutes per listing = 150+ hours
- **With autopilot**: A few minutes total
- **Result**: Save 99% of your time!

## 🎯 Common Use Cases

### Case 1: Quick Single Item
```bash
python3 scripts/autopilot_bot.py coin_photo.jpg output/
```

### Case 2: Batch with Custom Config
```bash
python3 scripts/autopilot_bot.py --config my_config.json --batch photos/ output/
```

### Case 3: Only Generate Titles
```bash
python3 scripts/bots/title_generator_bot.py --batch photos/ titles.json
```

### Case 4: Only Generate Descriptions
```bash
python3 scripts/bots/description_generator_bot.py --batch photos/ descriptions/
```

### Case 5: Only Crop Images
```bash
python3 scripts/bots/image_cropper_bot.py --batch photos/ cropped/
```

## ⚙️ Configuration

### Toggle Autopilot Mode
Edit `config/autopilot-config.json`:
```json
{
  "autopilot": {
    "enabled": true  // Set to false for manual control
  }
}
```

### Disable Specific Features
```json
{
  "image_cropper": {
    "enabled": false  // Skip image cropping
  },
  "title_generator": {
    "enabled": true   // Keep title generation
  },
  "description_generator": {
    "enabled": true   // Keep description generation
  }
}
```

### Customize Title Templates
```json
{
  "title_generator": {
    "templates": [
      "{year} {denomination} {condition}",
      "Rare {year} {type} - {condition}",
      "{type} {year} {mint_mark}"
    ]
  }
}
```

## 🔧 Troubleshooting

### "No images found"
- Make sure files have proper extensions (.jpg, .jpeg, .png, etc.)
- Check the directory path is correct
- Verify you have read permissions

### "Permission denied"
```bash
chmod +x scripts/autopilot_bot.py
chmod +x scripts/bots/*.py
```

### Python not found
Install Python 3.6+:
- **Ubuntu/Debian**: `sudo apt install python3`
- **macOS**: `brew install python3`
- **Windows**: Download from python.org

## 📊 Understanding Output

### Output Directory Structure
```
output/
├── item1_cropped.jpg          # Optimized image
├── item1_description.txt      # Full description
├── item2_cropped.jpg
├── item2_description.txt
├── ...
└── processing_summary.json    # Statistics and metadata
```

### Processing Summary
The `processing_summary.json` file contains:
- Number of items processed
- Success/failure counts
- Details for each listing
- Generated titles
- Output file paths

### Using the Output
1. **For eBay**: Upload cropped image, paste title and description
2. **For Etsy**: Use title/description in listing form
3. **For Custom Sites**: Import via API or manually paste
4. **For Inventory**: Use summary JSON for database import

## 🎓 Advanced Usage

### Run Individual Bots in Sequence
```bash
# Step 1: Crop all images
python3 scripts/bots/image_cropper_bot.py --batch photos/ cropped/

# Step 2: Generate titles
python3 scripts/bots/title_generator_bot.py --batch cropped/ titles.json

# Step 3: Generate descriptions
python3 scripts/bots/description_generator_bot.py --batch cropped/ descriptions/
```

### Use Different Configs for Different Collections
```bash
# Gold coins config
python3 scripts/autopilot_bot.py --config gold_config.json --batch gold_coins/ gold_output/

# Silver coins config
python3 scripts/autopilot_bot.py --config silver_config.json --batch silver_coins/ silver_output/
```

## 💡 Tips for Best Results

1. **Use Good Photos**: Clear, well-lit photos produce better results
2. **Provide Metadata**: The more info you provide, the better the descriptions
3. **Review Output**: Always review generated content before posting
4. **Customize Templates**: Adjust title templates for your items
5. **Batch Processing**: Process similar items together for consistency

## 🆘 Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Review [examples/sample_metadata.json](examples/sample_metadata.json) for metadata format
- Run `python3 scripts/autopilot_bot.py --help` for command options
- Open an issue on GitHub for bugs or feature requests

## 🎉 You're Ready!

Start processing your photos and create professional auction listings in minutes instead of hours!
