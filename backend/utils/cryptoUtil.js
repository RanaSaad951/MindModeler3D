require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'aes-256-cbc';

// Hash the secret to ensure it is ALWAYS exactly 32 bytes (256 bits)
const SECRET_KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY || 'mind_modeler_default_secret_key_32')).digest();

/**
 * Encrypts a file using AES-256-CBC with a SHA-256 derived key.
 * Overwrites the original file with encrypted data.
 * @param {string} filePath - Absolute path to the file.
 * @returns {string} - The Initialization Vector (IV) as a hex string.
 */
const encryptFile = (filePath) => {
  try {
    const iv = crypto.randomBytes(16);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    
    const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    // Overwrite the original file with encrypted content
    fs.writeFileSync(filePath, encrypted);
    
    return iv.toString('hex');
  } catch (error) {
    console.error('[Encryption Error]:', error.message);
    throw error; // Rethrow to let the route handler manage cleanup
  }
};

module.exports = { encryptFile };
