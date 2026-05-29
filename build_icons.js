import sharp from 'sharp';
import fs from 'fs';
import pngToIco from 'png-to-ico';

async function build() {
  const url = 'https://i.ibb.co/mrtDMPDF/p2.png';
  console.log('Downloading', url);
  const resp = await fetch(url);
  const buffer = Buffer.from(await resp.arrayBuffer());
  
  console.log('Resizing to base png');
  // First, create a perfect square transparent PNG
  const squarePng = await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
    
  fs.writeFileSync('public/favicon.png', squarePng);
  
  // Create 32x32, 16x16, 192x192, etc for manifest / touch icons
  await sharp(squarePng).resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp(squarePng).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(squarePng).resize(192, 192).png().toFile('public/android-chrome-192x192.png');
  await sharp(squarePng).resize(512, 512).png().toFile('public/android-chrome-512x512.png');
  await sharp(squarePng).resize(180, 180).flatten({ background: {r:255,g:255,b:255} }).png().toFile('public/apple-touch-icon.png');
  
  console.log('Building ICO');
  try {
    const icoBuf = await pngToIco(['public/favicon-16x16.png', 'public/favicon-32x32.png']);
    fs.writeFileSync('public/favicon.ico', icoBuf);
  } catch(e) {
    console.error('ICO failed, copying png', e);
  }
}
build().catch(console.error);
