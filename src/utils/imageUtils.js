/**
 * Image Compression Utility
 * Compresses images to WebP format with max dimensions for fast loading
 */

/**
 * Compress an image file to WebP format
 * @param {File} file - The input image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed WebP file
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    outputFormat = 'image/webp'
  } = options;

  return new Promise((resolve) => {
    // If not an image, return original file
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '') + '.webp',
                { type: 'image/webp' }
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          outputFormat,
          quality
        );
      };
      
      img.onerror = () => resolve(file);
    };
    
    reader.onerror = () => resolve(file);
  });
};

/**
 * Extract dominant colors from an image
 * @param {File} file - Image file
 * @returns {Promise<{primary: string, secondary: string}>} - Extracted colors
 */
export const extractColorsFromImage = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 10;
      canvas.height = 10;
      
      ctx.drawImage(img, 0, 0, 10, 10);
      const imgData = ctx.getImageData(0, 0, 10, 10).data;
      
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      
      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const brightness = (r + g + b) / 3;
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
        
        // Filter out very bright/dark and grayscale pixels
        if (brightness > 30 && brightness < 220 && maxDiff > 15) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }
      
      const rgbToHex = (r, g, b) =>
        '#' +
        [r, g, b]
          .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          })
          .join('');
      
      if (count > 0) {
        const primary = rgbToHex(
          Math.round(rSum / count),
          Math.round(gSum / count),
          Math.round(bSum / count)
        );
        const secondary = rgbToHex(
          Math.round((rSum / count + 128) % 256),
          Math.round((gSum / count + 128) % 256),
          Math.round((bSum / count + 128) % 256)
        );
        resolve({ primary, secondary });
      } else {
        resolve({ primary: '#1E3A8A', secondary: '#FFC107' });
      }
    };
    
    img.onerror = () => resolve({ primary: '#1E3A8A', secondary: '#FFC107' });
  });
};

/**
 * Convert data URL to File
 * @param {string} dataUrl - Base64 data URL
 * @param {string} fileName - Output filename
 * @returns {File}
 */
export const dataUrlToFile = (dataUrl, fileName) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], fileName, { type: mime });
};

/**
 * Preload images for better performance
 * @param {string[]} urls - Array of image URLs to preload
 * @returns {Promise<void>}
 */
export const preloadImages = (urls) => {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = reject;
          img.src = url;
        })
    )
  );
};

export default {
  compressImage,
  extractColorsFromImage,
  dataUrlToFile,
  preloadImages
};
