import os
import hashlib
import io
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from dotenv import load_dotenv
from pathlib import Path

# Load env from backend/.env
env_path = Path(__file__).resolve().parent.parent.parent / 'backend' / '.env'
load_dotenv(dotenv_path=env_path)

def get_secret_key():
    raw_key = os.getenv("ENCRYPTION_KEY", "mind_modeler_default_secret_key_32")
    # Duplicate Node.js SHA-256 key derivation
    return hashlib.sha256(raw_key.encode('utf-8')).digest()

def decrypt_nifti_to_stream(encrypted_file_path, iv_hex):
    """
    Decrypts an encrypted file entirely in-memory and returns a BytesIO stream.
    Never writes unencrypted data to disk.
    """
    try:
        if not os.path.exists(encrypted_file_path):
            candidates = [
                Path(__file__).resolve().parent.parent.parent / encrypted_file_path,
                Path(__file__).resolve().parent.parent.parent / 'backend' / encrypted_file_path,
                Path(__file__).resolve().parent.parent.parent / 'backend' / 'uploads' / os.path.basename(encrypted_file_path)
            ]
            found = False
            for cand in candidates:
                if cand.exists():
                    encrypted_file_path = str(cand)
                    found = True
                    break
            if not found:
                raise FileNotFoundError(f"Encrypted file not found: {encrypted_file_path}")

        key = get_secret_key()
        iv = bytes.fromhex(iv_hex)

        with open(encrypted_file_path, 'rb') as f:
            encrypted_data = f.read()

        cipher = AES.new(key, AES.MODE_CBC, iv)
        # Node.js 'aes-256-cbc' uses PKCS7 padding by default
        decrypted_data = unpad(cipher.decrypt(encrypted_data), AES.block_size)

        return io.BytesIO(decrypted_data)
    except Exception as e:
        print(f"[Python Encryption Error]: {str(e)}")
        raise e
