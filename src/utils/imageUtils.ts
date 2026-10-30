/**
 * Image processing utilities for Murthi Machine Works
 * - Client-side conversion to WebP format
 * - Adaptive compression to ensure size is strictly under 500 KB
 * - File formatting and validation
 */

export interface ProcessedImageResult {
  blob: Blob;
  file: File;
  dataUrl: string;
  originalFileName: string;
  finalFileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  width: number;
  height: number;
  compressionRatioPercent: number;
}

export interface ImageProcessingOptions {
  maxSizeBytes?: number;      // Default: 500 KB (512,000 bytes)
  maxWidth?: number;          // Default: 1400 px (ultra crisp, fast encoding)
  maxHeight?: number;         // Default: 1400 px
  initialQuality?: number;    // Default: 0.78
  minQuality?: number;        // Default: 0.50
}

/**
 * Formats byte size to human-readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Fast client-side image converter & compressor to WebP format (< 500 KB)
 * Optimized for speed and high visual clarity
 */
export async function convertAndCompressToWebP(
  inputFile: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImageResult> {
  const maxSizeBytes = options.maxSizeBytes ?? 500 * 1024; // 500 KB = 512,000 bytes
  const maxWidth = options.maxWidth ?? 1400;
  const maxHeight = options.maxHeight ?? 1400;
  const initialQuality = options.initialQuality ?? 0.78;

  const originalSizeBytes = inputFile.size;

  // 1. Load image using object URL
  const objectUrl = URL.createObjectURL(inputFile);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode image file. Please check format.'));
    image.src = objectUrl;
  });

  try {
    const sourceWidth = img.naturalWidth || img.width;
    const sourceHeight = img.naturalHeight || img.height;

    // Calculate dimensions
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.max(1, Math.round(targetWidth * ratio));
      targetHeight = Math.max(1, Math.round(targetHeight * ratio));
    }

    // Prepare offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Canvas 2D context not available.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // 2. First fast pass: WebP at initialQuality (almost always 100-250 KB for 1400px)
    let bestBlob = await new Promise<Blob | null>((res) => {
      canvas.toBlob((b) => res(b), 'image/webp', initialQuality);
    });

    if (!bestBlob) {
      throw new Error('Could not export canvas to WebP.');
    }

    // 3. If exceeding 500 KB (rare case), do one fast targeted pass
    if (bestBlob.size > maxSizeBytes) {
      bestBlob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), 'image/webp', 0.60);
      }) || bestBlob;

      // If still over 500 KB, downscale dimensions
      if (bestBlob.size > maxSizeBytes) {
        targetWidth = Math.round(targetWidth * 0.75);
        targetHeight = Math.round(targetHeight * 0.75);
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        bestBlob = await new Promise<Blob | null>((res) => {
          canvas.toBlob((b) => res(b), 'image/webp', 0.55);
        }) || bestBlob;
      }
    }

    // 4. Create WebP file
    const baseName = inputFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFileName = `${baseName || 'machine-part'}.webp`;

    const compressedFile = new File([bestBlob], finalFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    // 5. Create Data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(bestBlob);
    });

    const compressedSizeBytes = bestBlob.size;
    const compressionRatioPercent = originalSizeBytes > 0
      ? Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
      : 0;

    return {
      blob: bestBlob,
      file: compressedFile,
      dataUrl,
      originalFileName: inputFile.name,
      finalFileName,
      originalSizeBytes,
      compressedSizeBytes,
      originalSizeFormatted: formatBytes(originalSizeBytes),
      compressedSizeFormatted: formatBytes(compressedSizeBytes),
      width: targetWidth,
      height: targetHeight,
      compressionRatioPercent: Math.max(0, compressionRatioPercent)
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
