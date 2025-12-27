#!/usr/bin/env python3
"""
Local encoder / decoder that matches the in-page Pewpi encoder (PBKDF2 -> AES-GCM).

Usage (local machine only):
  1) pip install cryptography
  2) python encode_local.py

This script:
 - prompts you to enter text (hidden) to encode or decode
 - produces a single base64 string: salt(16) + iv(12) + ciphertext
 - can write server/.env locally with GITHUB_TOKEN_B64=<encoded> if you choose (DO NOT commit)

Security: run this locally on your machine. Do not paste raw secrets into public pages or commit them.
"""
import base64
import getpass
import os
from pathlib import Path
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import secrets

def derive_key(passphrase: bytes, salt: bytes, iterations: int = 200000) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=iterations,
        backend=default_backend()
    )
    return kdf.derive(passphrase)

def encrypt(plaintext: bytes, passphrase: str, iterations: int = 200000) -> str:
    salt = secrets.token_bytes(16)
    iv = secrets.token_bytes(12)
    key = derive_key(passphrase.encode('utf-8'), salt, iterations)
    aesgcm = AESGCM(key)
    ct = aesgcm.encrypt(iv, plaintext, None)
    combined = salt + iv + ct
    return base64.b64encode(combined).decode('ascii')

def decrypt(encoded_b64: str, passphrase: str, iterations: int = 200000) -> bytes:
    combined = base64.b64decode(encoded_b64)
    if len(combined) < 16+12+16:
        raise ValueError("Input too short or invalid")
    salt = combined[:16]
    iv = combined[16:28]
    ct = combined[28:]
    key = derive_key(passphrase.encode('utf-8'), salt, iterations)
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(iv, ct, None)

def main():
    print("Pewpi local encoder/decoder (runs locally). Do not commit outputs with raw secrets.")
    mode = input("Choose (e)ncode or (d)ecrypt: ").strip().lower()
    iters_input = input("PBKDF2 iterations (enter to keep 200000): ").strip()
    iterations = int(iters_input) if iters_input.isdigit() else 200000

    if mode == 'e':
        secret = getpass.getpass("Enter text to encode (input hidden): ")
        if not secret:
            print("No input, aborting.")
            return
        encoded = encrypt(secret.encode('utf-8'), getpass.getpass("Passphrase (hidden): "), iterations)
        print("\nENCODED OUTPUT (base64):\n")
        print(encoded)
        choice = input("\nWrite to server/.env as GITHUB_TOKEN_B64? (y/N): ").strip().lower()
        if choice == 'y':
            server_dir = Path('server'); server_dir.mkdir(exist_ok=True)
            env_path = server_dir / '.env'
            if env_path.exists():
                if input("server/.env exists — overwrite? (y/N): ").strip().lower() != 'y':
                    print("Aborted writing file.")
                    return
            env_contents = f"GITHUB_TOKEN_B64={encoded}\n# set COMMIT_SECRET locally\n# COMMIT_SECRET=your_secret_here\nPORT=4000\n"
            env_path.write_text(env_contents, encoding='utf-8')
            print(f"Wrote {env_path.resolve()} (do NOT commit it).")
    elif mode == 'd':
        encoded = input("Paste encoded base64 string: ").strip()
        if not encoded:
            print("No input, aborting.")
            return
        passphrase = getpass.getpass("Passphrase to decrypt (hidden): ")
        try:
            plaintext = decrypt(encoded, passphrase, iterations)
            print("\nDECRYPTED TEXT:\n")
            print(plaintext.decode('utf-8'))
        except Exception as e:
            print("Decryption failed:", str(e))
    else:
        print("Invalid option. Run again.")

if __name__ == '__main__':
    main()