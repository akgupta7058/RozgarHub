/**
 * Compresses an uploaded image file client-side using HTML5 Canvas
 * Max dimensions: 200x200px, JPEG at 0.7 quality
 * Resulting base64 string is typically 5KB to 15KB (100% free Firestore storage)
 */
export async function compressWorkerPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic file type check
    if (!file.type.startsWith('image/')) {
      reject(new Error('Kripya sirf photo (JPG/PNG) upload karein.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw and compress to JPEG at 0.7 quality
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Photo load karne mein dikkat aayi. Kripya doosri photo chunein.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read nahi ho payi.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Smart Phone Number Validation
 * - Exactly 10 digits
 * - Does not start with 0 (must start with 6-9)
 * - Blocks repeated digits (e.g. 9999999999, 1111111111)
 * - Blocks obvious fake patterns
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const clean = phone.replace(/\D/g, '');

  if (phone.startsWith('0')) {
    return { valid: false, error: 'Mobile number ke aage 0 na lagayein, seedha 10-digit number likhein.' };
  }

  if (clean.length !== 10) {
    return { valid: false, error: `Mobile number poora 10 digit ka hona chahiye (${clean.length}/10 digit likhe hain).` };
  }

  if (!/^[6-9]/.test(clean)) {
    return { valid: false, error: 'Mobile number 6, 7, 8, ya 9 se shuru hona chahiye.' };
  }

  // Block all repeated digits (e.g. 9999999999, 8888888888, 7777777777, 1111111111)
  if (/^(\d)\1{9}$/.test(clean)) {
    return { valid: false, error: 'Yeh fake number hai! Kripya apna asli 10-digit mobile number daalein.' };
  }

  // Block obvious sequential / dummy numbers
  const obviousFakes = [
    '1234567890',
    '9876543210',
    '0123456789',
    '9898989898',
    '9090909090',
    '8989898989',
    '7878787878',
    '9123456789',
  ];
  if (obviousFakes.includes(clean)) {
    return { valid: false, error: 'Yeh fake/dummy number lag raha hai. Kripya apna sahi number daalein.' };
  }

  return { valid: true };
}
