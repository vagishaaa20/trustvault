import os
import json
import hashlib
from datetime import datetime, timezone
from web3 import Web3
from web3.middleware import geth_poa_middleware

POLYGON_RPC = "https://rpc-amoy.polygon.technology/"
CONTRACT_ADDRESS = "0x05eea1F3E401B42f83D73E7c07951E23466DCDf5"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ABI_PATH = os.path.join(BASE_DIR, "compiled_code.json")

def generate_video_hash(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def verify(evidence_id, video_path):
    if not os.path.exists(video_path):
        raise Exception("Video file not found")

    print("========== EVIDENCE VERIFICATION ==========")

    new_hash = generate_video_hash(video_path)

    print(" Evidence ID    :", evidence_id)
    print(" File Path      :", video_path)
    print(" Computed Hash  :", new_hash)
    print("-------------------------------------------")

    web3 = Web3(Web3.HTTPProvider(POLYGON_RPC))
    web3.middleware_onion.inject(geth_poa_middleware, layer=0)

    if not web3.is_connected():
        raise Exception("Polygon not connected")

    print(" Blockchain     : Connected")

    with open(ABI_PATH) as f:
        abi = json.load(f)["abi"]

    contract = web3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=abi
    )

    try:
        stored_hash = contract.functions.getEvidenceHash(evidence_id).call()
    except Exception:
        print(" Evidence not found on blockchain")
        return False

    print(" Stored Hash    :", stored_hash)

    if stored_hash == new_hash:
        print(" VERIFICATION RESULT : AUTHENTIC")
        return True
    else:
        print(" VERIFICATION RESULT : TAMPERED")
        return False

if __name__ == "__main__":
    import sys
    result = verify(sys.argv[1], sys.argv[2])
    exit(0 if result else 1)
