import sys
import hashlib

file_path = sys.argv[1]

with open(file_path, "rb") as f:
    data = f.read()

hash_val = hashlib.sha256(data).hexdigest()
print(hash_val)
