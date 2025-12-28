#!/bin/bash

# Fix Screenshots for Apple App Store - Generate All Sizes
# This script reads from 'original' folder and generates all required sizes

echo "🔧 Generating All Screenshot Sizes for Apple App Store..."
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if ImageMagick is available (more reliable than sips for exact dimensions)
if command -v convert &> /dev/null; then
    USE_IMAGEMAGICK=true
    echo -e "${GREEN}✅ Using ImageMagick (more reliable)${NC}"
elif command -v sips &> /dev/null; then
    USE_IMAGEMAGICK=false
    echo -e "${YELLOW}⚠️  Using sips (ImageMagick recommended for better results)${NC}"
    echo "   Install ImageMagick: brew install imagemagick"
else
    echo -e "${RED}❌ Error: Neither ImageMagick nor sips found${NC}"
    exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ORIGINAL_DIR="$SCRIPT_DIR/screenshots/ios/original"

if [ ! -d "$ORIGINAL_DIR" ]; then
    echo -e "${RED}❌ Original directory not found: $ORIGINAL_DIR${NC}"
    echo "   Please create it and add your original screenshots there"
    exit 1
fi

# Define all required sizes (using arrays instead of associative array for better compatibility)
SIZE_NAMES=("iphone-6.7" "iphone-6.5" "iphone-5.5" "ipad-pro")
SIZE_DIMENSIONS=("1290:2796" "1242:2688" "1242:2208" "2048:2732")

echo "Reading screenshots from: $ORIGINAL_DIR"
echo "Generating sizes for:"
for i in "${!SIZE_NAMES[@]}"; do
    size_name="${SIZE_NAMES[$i]}"
    dimensions="${SIZE_DIMENSIONS[$i]}"
    width="${dimensions%%:*}"
    height="${dimensions##*:}"
    echo "  - $size_name: ${width} x ${height}"
done
echo ""

# Function to process a single screenshot for a specific size
process_screenshot() {
    local input_file=$1
    local output_dir=$2
    local target_width=$3
    local target_height=$4
    local size_name=$5
    
    local filename=$(basename "$input_file")
    local extension="${filename##*.}"
    local name="${filename%.*}"
    local ext_lower=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
    local output_file="$output_dir/${name}.${ext_lower}"
    
    # Create output directory if it doesn't exist
    mkdir -p "$output_dir"
    
    if [ "$USE_IMAGEMAGICK" = true ]; then
        # Use ImageMagick for more precise control
        convert "$input_file" \
            -resize "${target_width}x${target_height}!" \
            -colorspace sRGB \
            -profile "/System/Library/ColorSync/Profiles/sRGB Profile.icc" \
            -strip \
            -quality 100 \
            "$output_file" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            # Verify dimensions
            actual_width=$(identify -format "%w" "$output_file" 2>/dev/null)
            actual_height=$(identify -format "%h" "$output_file" 2>/dev/null)
            
            if [ "$actual_width" = "$target_width" ] && [ "$actual_height" = "$target_height" ]; then
                echo -e "    ${GREEN}✅ ${size_name}: ${actual_width}x${actual_height}${NC}"
                return 0
            else
                echo -e "    ${RED}❌ ${size_name}: Wrong dimensions ${actual_width}x${actual_height}${NC}"
                rm -f "$output_file"
                return 1
            fi
        else
            echo -e "    ${RED}❌ ${size_name}: Failed to process${NC}"
            return 1
        fi
    else
        # Use sips (fallback)
        local temp_file="$output_dir/.temp_${name}.png"
        
        # Resize to exact dimensions
        sips -z $target_height $target_width "$input_file" --out "$temp_file" > /dev/null 2>&1
        
        # Convert to sRGB
        sips -m "/System/Library/ColorSync/Profiles/sRGB Profile.icc" "$temp_file" --out "$temp_file" > /dev/null 2>&1
        
        # Convert to PNG and remove metadata
        sips -s format png -s formatOptions default "$temp_file" --out "$output_file" > /dev/null 2>&1
        
        rm -f "$temp_file"
        
        if [ -f "$output_file" ]; then
            # Verify dimensions
            actual_width=$(sips -g pixelWidth "$output_file" | tail -1 | awk '{print $2}')
            actual_height=$(sips -g pixelHeight "$output_file" | tail -1 | awk '{print $2}')
            
            if [ "$actual_width" = "$target_width" ] && [ "$actual_height" = "$target_height" ]; then
                echo -e "    ${GREEN}✅ ${size_name}: ${actual_width}x${actual_height}${NC}"
                return 0
            else
                echo -e "    ${RED}❌ ${size_name}: Wrong dimensions ${actual_width}x${actual_height}${NC}"
                rm -f "$output_file"
                return 1
            fi
        else
            echo -e "    ${RED}❌ ${size_name}: Failed to create output${NC}"
            return 1
        fi
    fi
}

# Enable nullglob to handle cases where no files match
shopt -s nullglob

total_processed=0
total_success=0

# Process each screenshot in the original folder
for file in "$ORIGINAL_DIR"/*.{png,jpg,jpeg} "$ORIGINAL_DIR"/*.{PNG,JPG,JPEG}; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo -e "Processing: ${GREEN}$filename${NC}"
        
        success_count=0
        
        # Generate all sizes for this screenshot
        for i in "${!SIZE_NAMES[@]}"; do
            size_name="${SIZE_NAMES[$i]}"
            dimensions="${SIZE_DIMENSIONS[$i]}"
            width="${dimensions%%:*}"
            height="${dimensions##*:}"
            output_dir="$SCRIPT_DIR/screenshots/ios/$size_name"
            
            # Ensure output directory exists
            mkdir -p "$output_dir"
            
            if process_screenshot "$file" "$output_dir" "$width" "$height" "$size_name"; then
                success_count=$((success_count + 1))
            fi
        done
        
        if [ $success_count -eq ${#SIZE_NAMES[@]} ]; then
            total_success=$((total_success + 1))
        fi
        total_processed=$((total_processed + 1))
        echo ""
    fi
done

# Disable nullglob
shopt -u nullglob

echo -e "${GREEN}✨ Done!${NC}"
echo "   Processed: $total_processed screenshot(s)"
echo "   Successfully generated all sizes: $total_success screenshot(s)"
echo ""
echo "📋 Generated files are in:"
for size_name in "${SIZE_NAMES[@]}"; do
    echo "   - screenshots/ios/$size_name/"
done
echo ""
echo "📤 Next steps:"
echo "   1. Review the generated screenshots"
echo "   2. Upload to App Store Connect:"
echo "      - iPhone 6.7\" → screenshots/ios/iphone-6.7/ (use in 6.9\" section)"
echo "      - iPhone 6.5\" → screenshots/ios/iphone-6.5/"
echo "      - iPhone 5.5\" → screenshots/ios/iphone-5.5/"
echo "      - iPad Pro → screenshots/ios/ipad-pro/"
echo ""
