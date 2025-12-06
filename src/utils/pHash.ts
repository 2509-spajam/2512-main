import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

const SIZE = 64;

/**
 * Perform a 1D Discrete Cosine Transform (DCT-II) on an array.
 */
function dct1D(input: Float64Array): Float64Array {
  const N = input.length;
  const output = new Float64Array(N);

  for (let k = 0; k < N; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) {
      sum += input[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
    }
    // Scale factor (standard orthonormalization is not strictly needed for pHash relative comparison, 
    // but correct scaling is usually: (k==0 ? 1/sqrt(2) : 1) * sqrt(2/N) * sum
    // For pHash median comparison, constant scaling factors cancel out, so we can omit them or keep them simple.
    // We will apply the standard factor for correctness.
    const alpha = k === 0 ? 1 / Math.sqrt(2) : 1;
    output[k] = Math.sqrt(2 / N) * alpha * sum;
  }
  return output;
}

/**
 * Perform a 2D DCT on a square matrix (Size x Size).
 * Separable approach: DCT rows, then DCT columns.
 */
function dct2D(matrix: Float64Array, size: number): Float64Array {
  const temp = new Float64Array(size * size);
  const output = new Float64Array(size * size);

  // 1. DCT rows
  for (let y = 0; y < size; y++) {
    const row = new Float64Array(size);
    for (let x = 0; x < size; x++) {
      row[x] = matrix[y * size + x];
    }
    const dctRow = dct1D(row);
    for (let x = 0; x < size; x++) {
      temp[y * size + x] = dctRow[x];
    }
  }

  // 2. DCT cols
  for (let x = 0; x < size; x++) {
    const col = new Float64Array(size);
    for (let y = 0; y < size; y++) {
      col[y] = temp[y * size + x];
    }
    const dctCol = dct1D(col);
    for (let y = 0; y < size; y++) {
      output[y * size + x] = dctCol[y];
    }
  }

  return output;
}

/**
 * Compute the perceptual hash (pHash) of an image URI using DCT.
 */
export async function computePHash(uri: string): Promise<string> {
  // 1. Resize to 64x64 and convert to grayscale using Expo Native Module
  // Increased size for better detail accuracy before DCT
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: SIZE, height: SIZE } }],
    { format: ImageManipulator.SaveFormat.JPEG, compress: 1.0, base64: true }
  );

  // Convert to grayscale isn't strictly an option in manip, but we can just use the Y channel (luminance) later.
  // Actually, manipulateAsync doesn't have a grayscale action.
  // We will extract luminance during pixel reading.
  // But resizing to 32x32 is the key performance optimization here.

  if (!result.base64) {
    throw new Error('Failed to get base64 data from image manipulator');
  }

  // 2. Decode JPEG to get pixel data
  const buffer = Buffer.from(result.base64, 'base64');
  const rawData = jpeg.decode(buffer, { useTArray: true }); // returns width, height, data (Uint8Array, RGBA)

  // 3. Extract luminance (Y)
  // Y = 0.299R + 0.587G + 0.114B
  const matrix = new Float64Array(SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = rawData.data[i * 4];
    const g = rawData.data[i * 4 + 1];
    const b = rawData.data[i * 4 + 2];
    matrix[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // 4. Compute DCT
  const dctMatrix = dct2D(matrix, SIZE);

  // 5. Reduce DCT: Keep top-left 16x16 (highest energy low freq), excluding DC at (0,0)
  // Standard pHash uses 8x8 from 32x32 (1/4th).
  // For 64x64, 16x16 is the equivalent frequency band (1/4th).
  // hash length will be 256 - 1 = 255 bits.
  const lowFreqSize = 16;
  const lowFreqList: number[] = [];

  for (let y = 0; y < lowFreqSize; y++) {
    for (let x = 0; x < lowFreqSize; x++) {
      if (x === 0 && y === 0) continue; // Skip DC
      lowFreqList.push(dctMatrix[y * SIZE + x]);
    }
  }

  // 6. Compute median
  const sortedList = [...lowFreqList].sort((a, b) => a - b);
  const mid = Math.floor(sortedList.length / 2);
  const median = sortedList.length % 2 !== 0
    ? sortedList[mid]
    : (sortedList[mid - 1] + sortedList[mid]) / 2;

  // 7. Construct Hash
  let hash = '';
  for (const val of lowFreqList) {
    hash += val > median ? '1' : '0';
  }

  return hash;
}

/**
 * Calculate Hamming distance between two binary strings.
 */
function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error('Hashes must be of equal length');
  }
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      dist++;
    }
  }
  return dist;
}

/**
 * Compute similarity percentage between two images.
 * Returns a number between 0 and 100.
 */
export async function compareImages(uri1: string, uri2: string): Promise<number> {
  const hash1 = await computePHash(uri1);
  const hash2 = await computePHash(uri2);

  const distance = hammingDistance(hash1, hash2);
  // Max distance is 63 (since we extracted 64 coeff and skipped DC? Wait.
  // 8x8 = 64. minus (0,0) is 63 items.
  // Actually standard pHash usually keeps 64 bits. DCT 32x32 -> 8x8 = 64 values.
  // Standard algo often DOES include DC or just ignores it for median calculation but keeps it in hash?
  // Wikipedia/Standard impls: "Reduce the DCT. This is the magic step. While the DCT is 32x32, just keep the top-left 8x8. These 64 values present the lowest frequencies in the picture."
  // "Compute the average value. Calculate the mean of these 64 values." (Some use median for robustness against gamma correction/histogram equalization).
  // "Further reduce the DCT. Set the 64 bits to 0 or 1 depending on whether each of the 64 DCT values is above or below the average value."
  // Often the very first term (DC) is excluded from the average calculation because it can be huge and skew the average, but the bit for it might still be generated?
  // Including DC in hash implies we care about absolute brightness. pHash is usually robust to brightness changes.
  // So skipping DC for BOTH median calculation AND hash generation is safer for brightness invariance.
  // So we have 63 bits.

  // Hash length is 16*16 - 1 = 255
  const hashLength = 255;
  return Math.max(0, Math.min(100, (1 - distance / hashLength) * 100));
}
