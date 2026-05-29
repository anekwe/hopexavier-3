import sharp from 'sharp';
import fs from 'fs';
import https from 'https';

async function downloadAndGenerate() {
  const inputPath = 'public/raw-logo.png';
  
  // Download file
  const res = await fetch('https://i.ibb.co/mrtDMPDF/p2.png');
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(inputPath, Buffer.from(buffer));
  
  // Convert into perfect squares with transparent background matching standard favicon sizes
  const sizes = [16, 32, 48, 192, 512, 180];
  
  for (const size of sizes) {
    let name = '';
    if (size === 192) name = 'android-chrome-192x192.png';
    else if (size === 512) name = 'android-chrome-512x512.png';
    else if (size === 180) name = 'apple-touch-icon.png';
    else name = `favicon-${size}x${size}.png`;

    await sharp(inputPath)
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(`public/${name}`);
  }

  // Copy 32x32 to favicon.ico (modern browsers accept PNG as ICO)
  // Wait, real ICO is better. sharp doesn't have ICO natively. 
  // Naming a PNG as .ico is generally ok for modern browsers, but actually using png for favicon usually works best with link rel="icon".
  fs.copyFileSync(`public/favicon-48x48.png`, 'public/favicon.ico');
  
  console.log('Favicons generated successfully.');
}

downloadAndGenerate();
