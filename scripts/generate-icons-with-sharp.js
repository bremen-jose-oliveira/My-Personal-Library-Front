const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '../assets/images/app-icon.png');
const outputDir = path.join(__dirname, '../assets/icons');

// Create output directories
const iosDir = path.join(outputDir, 'ios');
const androidDir = path.join(outputDir, 'android');

if (!fs.existsSync(iosDir)) fs.mkdirSync(iosDir, { recursive: true });
if (!fs.existsSync(androidDir)) fs.mkdirSync(androidDir, { recursive: true });

// Icon sizes
const iconSizes = {
  ios: [
    { name: 'AppIcon-20x20@2x.png', size: 40 },
    { name: 'AppIcon-20x20@3x.png', size: 60 },
    { name: 'AppIcon-29x29@1x.png', size: 29 },
    { name: 'AppIcon-29x29@2x.png', size: 58 },
    { name: 'AppIcon-29x29@3x.png', size: 87 },
    { name: 'AppIcon-40x40@1x.png', size: 40 },
    { name: 'AppIcon-40x40@2x.png', size: 80 },
    { name: 'AppIcon-40x40@3x.png', size: 120 },
    { name: 'AppIcon-60x60@2x.png', size: 120 },
    { name: 'AppIcon-60x60@3x.png', size: 180 },
    { name: 'AppIcon-76x76@1x.png', size: 76 },
    { name: 'AppIcon-76x76@2x.png', size: 152 },
    { name: 'AppIcon-83.5x83.5@2x.png', size: 167 },
    { name: 'AppIcon-1024x1024@1x.png', size: 1024 },
  ],
  android: [
    { name: 'mdpi.png', size: 48 },
    { name: 'hdpi.png', size: 72 },
    { name: 'xhdpi.png', size: 96 },
    { name: 'xxhdpi.png', size: 144 },
    { name: 'xxxhdpi.png', size: 192 },
    { name: 'play-store-icon.png', size: 512 },
  ]
};

async function generateIcons() {
  console.log('Generating icons from:', sourceIcon);
  console.log('Output directory:', outputDir);
  console.log('\n');

  // Generate iOS icons
  console.log('Generating iOS icons...');
  for (const icon of iconSizes.ios) {
    const outputPath = path.join(iosDir, icon.name);
    await sharp(sourceIcon)
      .resize(icon.size, icon.size, { fit: 'cover' })
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated: ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate Android icons
  console.log('\nGenerating Android icons...');
  for (const icon of iconSizes.android) {
    const outputPath = path.join(androidDir, icon.name);
    await sharp(sourceIcon)
      .resize(icon.size, icon.size, { fit: 'cover' })
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated: ${icon.name} (${icon.size}x${icon.size})`);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log(`\nIcons saved to:`);
  console.log(`- iOS: ${iosDir}`);
  console.log(`- Android: ${androidDir}`);
  console.log(`\nMost important files:`);
  console.log(`- iOS App Store: ${path.join(iosDir, 'AppIcon-1024x1024@1x.png')}`);
  console.log(`- Android Play Store: ${path.join(androidDir, 'play-store-icon.png')}`);
}

// Check if source icon exists
if (!fs.existsSync(sourceIcon)) {
  console.error(`❌ Error: Source icon not found at ${sourceIcon}`);
  process.exit(1);
}

generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});

