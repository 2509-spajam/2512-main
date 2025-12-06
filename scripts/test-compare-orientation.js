require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTION_NAME = 'compare-images';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const image1Path = path.join(__dirname, '../assets/test1.png');

if (!fs.existsSync(image1Path)) {
  console.error('Error: Test image test1.png not found in assets/ directory');
  process.exit(1);
}

async function testOrientation() {
  console.log('--- Starting Orientation Test ---');
  console.log(`Target Function: ${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`);

  try {
    // 1. Prepare Image 1 (Original)
    console.log('Reading Image 1...');
    const buffer1 = fs.readFileSync(image1Path);
    // Resize to reasonable size to speed up Base64 and avoid limits (e.g., 800px width)
    const processedBuffer1 = await sharp(buffer1)
      .resize(800)
      .toBuffer();
    const base64Image1 = `data:image/jpeg;base64,${processedBuffer1.toString('base64')}`;

    // 2. Prepare Image 2 (Rotated 90 degrees)
    console.log('Creating Rotated Image 2 (90 degrees)...');
    const rotatedBuffer = await sharp(buffer1)
      .resize(800)
      .rotate(90)
      .toBuffer();
    const base64Image2 = `data:image/jpeg;base64,${rotatedBuffer.toString('base64')}`;

    console.log('Images encoded. Sending request...');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        image1: base64Image1,
        image2: base64Image2,
      }),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Request failed:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n--- Result (Rotated Comparison) ---');
    console.log('Score:', data.score);
    console.log('Reason:', data.reason);
    console.log('----------------');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testOrientation();
