import dotenv from 'dotenv';
dotenv.config();

const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const payloadBase64 = key.split('.')[1];
if (payloadBase64) {
  const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
  console.log("Payload:", payloadStr);
} else {
  console.log("Not a JWT");
}
