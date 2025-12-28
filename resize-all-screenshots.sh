#!/bin/bash

# Batch Resize Screenshots for App Store
# This script resizes all screenshots in the screenshots folder to Apple's required dimensions

echo "📸 Batch Resizing Screenshots for App Store..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to resize screenshots in a directory
resize_directory() {
    local dir=$1
    local width=$2
    local height=$3
    local device_name=$4
    
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}⚠️  Directory not found: $dir${NC}"
        return
    fi
    
    local count=0
    # Enable nullglob to handle cases where no files match
    shopt -s nullglob
    
    # Find all image files (case-insensitive), but skip already resized files
    for file in "$dir"/*.{png,jpg,jpeg} "$dir"/*.{PNG,JPG,JPEG}; do
        if [ -f "$file" ] && [[ ! "$file" =~ _resized\.(png|jpg|jpeg|PNG|JPG|JPEG)$ ]]; then
            filename=$(basename "$file")
            extension="${filename##*.}"
            name="${filename%.*}"
            # Convert extension to lowercase
            ext_lower=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
            output_file="$dir/${name}_resized.${ext_lower}"
            
            echo -e "  Resizing: ${GREEN}$filename${NC} → ${GREEN}${name}_resized.${ext_lower}${NC}"
            
            # Resize to exact dimensions and convert to sRGB color space (required by Apple)
            # Using -z forces exact dimensions (height first, then width for sips)
            # First resize, then convert color space, then ensure PNG format
            sips -z $height $width "$file" --out "$output_file" > /dev/null 2>&1
            
            # Convert to sRGB color space (required by Apple)
            sips -m "/System/Library/ColorSync/Profiles/sRGB Profile.icc" "$output_file" --out "$output_file" > /dev/null 2>&1
            
            # Ensure PNG format
            sips -s format png "$output_file" --out "$output_file" > /dev/null 2>&1
            
            if [ $? -eq 0 ]; then
                count=$((count + 1))
                # Verify dimensions
                actual_width=$(sips -g pixelWidth "$output_file" | tail -1 | awk '{print $2}')
                actual_height=$(sips -g pixelHeight "$output_file" | tail -1 | awk '{print $2}')
                
                # Verify color space
                color_space=$(sips -g space "$output_file" 2>/dev/null | tail -1 | awk '{print $2}')
                
                if [ "$actual_width" = "$width" ] && [ "$actual_height" = "$height" ]; then
                    if [ "$color_space" = "RGB" ] || [ "$color_space" = "srgb" ]; then
                        echo -e "    ✅ Verified: ${actual_width}x${actual_height} (${color_space})"
                    else
                        echo -e "    ✅ Dimensions: ${actual_width}x${actual_height} (⚠️  Color space: ${color_space})"
                    fi
                else
                    echo -e "    ${RED}⚠️  Warning: Dimensions are ${actual_width}x${actual_height} (expected ${width}x${height})${NC}"
                fi
            else
                echo -e "    ${RED}❌ Failed to resize${NC}"
            fi
        fi
    done
    
    # Disable nullglob
    shopt -u nullglob
    
    if [ $count -gt 0 ]; then
        echo -e "${GREEN}✅ Resized $count screenshot(s) for $device_name${NC}"
    else
        echo -e "${YELLOW}⚠️  No screenshots found in $device_name${NC}"
    fi
    echo ""
}

# Check if sips is available (macOS only)
if ! command -v sips &> /dev/null; then
    echo -e "${RED}❌ Error: 'sips' command not found. This script requires macOS.${NC}"
    echo "   On Linux, use ImageMagick: convert input.png -resize WIDTHxHEIGHT! output.png"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"

if [ ! -d "$SCREENSHOTS_DIR" ]; then
    echo -e "${RED}❌ Screenshots directory not found: $SCREENSHOTS_DIR${NC}"
    echo "   Creating directory structure..."
    mkdir -p "$SCREENSHOTS_DIR/ios/iphone-6.7"
    mkdir -p "$SCREENSHOTS_DIR/ios/iphone-6.5"
    mkdir -p "$SCREENSHOTS_DIR/ios/iphone-5.5"
    mkdir -p "$SCREENSHOTS_DIR/ios/ipad-pro"
    mkdir -p "$SCREENSHOTS_DIR/android/phone"
    mkdir -p "$SCREENSHOTS_DIR/android/tablet"
    echo -e "${GREEN}✅ Created directory structure${NC}"
    echo ""
fi

echo "Resizing screenshots to Apple's required dimensions..."
echo ""

# iPhone 6.7" (iPhone 15 Plus, 14 Pro Max): 1290 x 2796
if [ -d "$SCREENSHOTS_DIR/ios/iphone-6.7" ]; then
    echo -e "${YELLOW}📱 iPhone 6.7\" (1290 x 2796)${NC}"
    resize_directory "$SCREENSHOTS_DIR/ios/iphone-6.7" 1290 2796 "iPhone 6.7\""
fi

# iPhone 6.5" (iPhone 11/12/13 Pro Max): 1242 x 2688
if [ -d "$SCREENSHOTS_DIR/ios/iphone-6.5" ]; then
    echo -e "${YELLOW}📱 iPhone 6.5\" (1242 x 2688)${NC}"
    resize_directory "$SCREENSHOTS_DIR/ios/iphone-6.5" 1242 2688 "iPhone 6.5\""
fi

# iPhone 5.5" (iPhone 8 Plus): 1242 x 2208
if [ -d "$SCREENSHOTS_DIR/ios/iphone-5.5" ]; then
    echo -e "${YELLOW}📱 iPhone 5.5\" (1242 x 2208)${NC}"
    resize_directory "$SCREENSHOTS_DIR/ios/iphone-5.5" 1242 2208 "iPhone 5.5\""
fi

# iPad Pro 12.9": 2048 x 2732
if [ -d "$SCREENSHOTS_DIR/ios/ipad-pro" ]; then
    echo -e "${YELLOW}📱 iPad Pro 12.9\" (2048 x 2732)${NC}"
    resize_directory "$SCREENSHOTS_DIR/ios/ipad-pro" 2048 2732 "iPad Pro 12.9\""
fi

echo -e "${GREEN}✨ Done!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Review the *_resized.* files"
echo "   2. Delete originals if resized versions look good"
echo "   3. Upload resized screenshots to App Store Connect"
echo ""
echo "💡 Tip: Original files are preserved. Only *_resized.* files are created."
