import os
import json
import hashlib
import sys
from datetime import datetime, timezone
from web3 import Web3

# ---------------- CONFIG ---------------- #

GANACHE_URL = "http://127.0.0.1:7545"
CONTRACT_ADDRESS = "0x05eea1F3E401B42f83D73E7c07951E23466DCDf5"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ABI_PATH = os.path.join(BASE_DIR, "compiled_code.json")

# --------------------------------------- #

def generate_video_hash(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def insert(case_id, evidence_id, video_path):

    if not os.path.exists(video_path):
        raise Exception("Video file not found")

    # 1️⃣ Generate hash
    video_hash = generate_video_hash(video_path)
    local_timestamp = datetime.now(timezone.utc).isoformat()

    print("========== EVIDENCE INGESTION ==========")
    print(" Case ID        :", case_id)
    print(" Evidence ID    :", evidence_id)
    print(" File Path      :", video_path)
    print(" SHA-256 Hash   :", video_hash)
    print(" Local Time     :", local_timestamp)
    print("----------------------------------------")

    # 2️⃣ Connect to Ethereum
    web3 = Web3(Web3.HTTPProvider(GANACHE_URL))
    if not web3.is_connected():
        raise Exception("Blockchain not connected")

    account = web3.eth.accounts[0]
    web3.eth.default_account = account

    print("blockchain     : Connected")
    print("sender Account :", account)

    # 3️⃣ Load ABI
    with open(ABI_PATH) as f:
        compiled_data = json.load(f)
        abi = compiled_data["abi"]

    contract = web3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=abi
    )

    # 4️⃣ Call smart contract
    try:
        tx_hash = contract.functions.addEvidence(
            case_id,
            evidence_id,
            video_hash
        ).transact()

        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        block = web3.eth.get_block(receipt.blockNumber)

        print("----------------------------------------")
        print(" Blockchain Write Successful")
        print(" Block Number  :", receipt.blockNumber)
        print(" Tx Hash       :", receipt.transactionHash.hex())
        print(" Gas Used      :", receipt.gasUsed)
        print(" Block Time    :", datetime.utcfromtimestamp(block.timestamp).isoformat() + "Z")
        print("========================================")

        # 5️⃣ Return structured result (for backend / frontend)
        return {
            "case_id": case_id,
            "evidence_id": evidence_id,
            "video_hash": video_hash,
            "local_timestamp": local_timestamp,
            "block_number": receipt.blockNumber,
            "block_timestamp": datetime.fromtimestamp(block.timestamp).isoformat() + "Z",
            "transaction_hash": receipt.transactionHash.hex(),
            "gas_used": receipt.gasUsed
        }
    except Exception as e:
        error_msg = str(e)
        if "Evidence already exists" in error_msg:
            print("----------------------------------------")
            print("  Evidence Already Stored")
            print(" Evidence ID:", evidence_id)
            print(" This evidence ID has already been recorded on the blockchain")
            print(" Tip: Use a unique evidence ID or verify existing evidence instead")
            print("========================================")
            print("BLOCKCHAIN_DUPLICATE: Evidence already exists")
    sys.exit(2)   # controlled exit, NOT a crash

    print("BLOCKCHAIN_ERROR:", error_msg)
    sys.exit(1)

# -------- CLI SUPPORT (IMPORTANT) --------
if __name__ == "__main__":
    import sys
    insert(sys.argv[1], sys.argv[2], sys.argv[3])
