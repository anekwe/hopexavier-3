import sharp from 'sharp';
import fs from 'fs';

async function buildFavicons() {
  const url = 'https://i.ibb.co/mrtDMPDF/p2.png';
  const imgResponse = await fetch(url);
  const buffer = Buffer.from(await imgResponse.arrayBuffer());

  // Crop top square out of 376x664, or just resize to square (contain)
  
  await sharp(buffer)
    .resize(32, 32, { fit: 'contain', background: {r:255,g:255,b:255,alpha:0} })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile('public/favicon.png');

  await sharp(buffer)
    .resize(192, 192, { fit: 'contain', background: {r:255,g:255,b:255,alpha:0} })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile('public/favicon-192x192.png');

  await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: {r:255,g:255,b:255,alpha:0} })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile('public/favicon-512x512.png');
    
  await sharp(buffer)
    .resize(180, 180, { fit: 'contain', background: {r:255,g:255,b:255,alpha:1} }) // Apple touch wants solid bg
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 90 }) // Apple touch can be jpg
    .toFile('public/apple-touch-icon.jpg');

  // Convert 32x32 to ICO format if we can, but since sharp doesn't do ico natively and png-to-ico makes huge files, 
  // Let's just create a raw 32x32 ico via a tiny package, or just rename the png (sometimes works).
  // I will just use absolute paths to favicon.png.
  console.log("Done");
}
buildFavicons();
