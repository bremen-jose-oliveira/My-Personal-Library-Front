const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Use your splash screen logo as the source (or any image you prefer)
const sourceImage = path.join(__dirname, '../assets/images/splashscreen_logo.jpg');
const outputIcon = path.join(__dirname, '../assets/images/app-icon.png');

async function createIcon() {
  console.log('Creating app icon from:', sourceImage);
  console.log('Output:', outputIcon);
  console.log('\n');

  try {
    // Resize to 1024x1024 (square, required for app icons)
    await sharp(sourceImage)
      .resize(1024, 1024, {
        fit: 'cover', // Crop to fit (maintains aspect ratio, may crop edges)
        position: 'center' // Center the crop
      })
      .png() // Convert to PNG
      .toFile(outputIcon);

    console.log('✅ Icon created successfully!');
    console.log(`\nIcon saved to: ${outputIcon}`);
    console.log('\nNow update app.config.js to use:');
    console.log('  icon: "./assets/images/app-icon.png"');
    console.log('  android.adaptiveIcon.foregroundImage: "./assets/images/app-icon.png"');
    
    // Also create a square version for adaptive icon
    const adaptiveIcon = path.join(__dirname, '../assets/images/adaptive-icon-custom.png');
    await sharp(sourceImage)
      .resize(1024, 1024, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(adaptiveIcon);
    
    console.log(`\nAdaptive icon saved to: ${adaptiveIcon}`);
    console.log('\nYou can now use this instead of the default Expo icon!');

  } catch (error) {
    console.error('❌ Error creating icon:', error.message);
    if (error.code === 'ENOENT') {
      console.error(`\nSource image not found: ${sourceImage}`);
      console.error('Available images:');
      const imagesDir = path.join(__dirname, '../assets/images');
      const files = fs.readdirSync(imagesDir);
      files.forEach(file => {
        if (/\.(jpg|jpeg|png|gif)$/i.test(file)) {
          console.error(`  - ${file}`);
        }
      });
    }
    process.exit(1);
  }
}

createIcon();

