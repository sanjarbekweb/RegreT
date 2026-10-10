/**
 * Client-side image compression utility.
 * Downscales images to fit within max dimensions and converts to JPEG at target quality.
 * Prevents localStorage QuotaExceededError while preserving clear visual fidelity for selfies,
 * coding screenshots, whiteboard photos, and textbook excerpts.
 */
export async function compressImage(
  source: File | string,
  maxDimension = 1280,
  quality = 0.82
): Promise<{ dataUrl: string; sizeBytes: number }> {
  // If in Node / test / SSR environment without DOM Image or Canvas, return fallback
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    if (typeof source === 'string') {
      return { dataUrl: source, sizeBytes: source.length };
    }
    return { dataUrl: 'data:image/jpeg;base64,mock', sizeBytes: 1024 };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    const processDataUrl = (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl, sizeBytes: Math.round(dataUrl.length * 0.75) });
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxBytes = Math.round(compressedDataUrl.length * 0.75);
        resolve({ dataUrl: compressedDataUrl, sizeBytes: approxBytes });
      };

      img.onerror = () => {
        resolve({ dataUrl, sizeBytes: Math.round(dataUrl.length * 0.75) });
      };

      img.src = dataUrl;
    };

    if (typeof source === 'string') {
      processDataUrl(source);
    } else {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        processDataUrl(result);
      };
      reader.onerror = () => {
        resolve({ dataUrl: '', sizeBytes: 0 });
      };
      reader.readAsDataURL(source);
    }
  });
}
