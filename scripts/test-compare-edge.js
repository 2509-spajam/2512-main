require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTION_NAME = 'compare-images';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const image1Path = path.join(__dirname, '../assets/test1.png');
const image2Path = path.join(__dirname, '../assets/test2.png');

if (!fs.existsSync(image1Path) || !fs.existsSync(image2Path)) {
  console.error('Error: Test images not found in assets/ directory (test1.png, test2.png)');
  process.exit(1);
}

async function testCompareImages() {
  console.log('--- Starting Edge Function Test ---');
  console.log(`Target Function: ${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`);

  try {
    // Read and encode images
    console.log('Reading and encoding images...');
    const bitmap1 = fs.readFileSync(image1Path);
    const bitmap2 = fs.readFileSync(image2Path);

    // Convert to Base64 data URL format
    const base64Image1 = `data:image/png;base64,${Buffer.from(bitmap1).toString('base64')}`;
    const base64Image2 = `data:image/png;base64,${Buffer.from(bitmap2).toString('base64')}`;

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
    console.log('\n--- Success! ---');
    console.log('Score:', data.score);
    console.log('Reason:', data.reason);
    console.log('----------------');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testCompareImages();
