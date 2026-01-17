import os
import json
import hashlib
import sys
from datetime import datetime, timezone
from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
load_dotenv()


POLYGON_RPC = "https://rpc-amoy.polygon.technology/"
CHAIN_ID = 80002
CONTRACT_ADDRESS = "0x05eea1F3E401B42f83D73E7c07951E23466DCDf5"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ABI_PATH = os.path.join(BASE_DIR, "compiled_code.json")

def generate_video_hash(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def insert(case_id, evidence_id, video_path):
    if not os.path.exists(video_path):
        raise Exception("Video file not found")

    video_hash = generate_video_hash(video_path)
    local_timestamp = datetime.now(timezone.utc).isoformat()

    print("========== EVIDENCE INGESTION ==========")
    print("Case ID        :", case_id)
    print("Evidence ID    :", evidence_id)
    print("File Path      :", video_path)
    print("SHA-256 Hash   :", video_hash)
    print("Local Time     :", local_timestamp)
    print("----------------------------------------")

    web3 = Web3(Web3.HTTPProvider(POLYGON_RPC))
    web3.middleware_onion.inject(geth_poa_middleware, layer=0)

    if not web3.is_connected():
        raise Exception("Blockchain not connected")

    PRIVATE_KEY = os.getenv("PRIVATE_KEY")
    SENDER_ADDRESS = os.getenv("SENDER_ADDRESS")

    if not PRIVATE_KEY or not SENDER_ADDRESS:
        raise Exception("Missing PRIVATE_KEY or SENDER_ADDRESS")

    SENDER_ADDRESS = Web3.to_checksum_address(SENDER_ADDRESS)

    with open(ABI_PATH) as f:
        compiled_data = json.load(f)
        abi = compiled_data["abi"]

    contract = web3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=abi
    )

    try:
        nonce = web3.eth.get_transaction_count(SENDER_ADDRESS)

        txn = contract.functions.addEvidence(
            case_id,
            evidence_id,
            video_hash
        ).build_transaction({
            "chainId": CHAIN_ID,
            "from": SENDER_ADDRESS,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": web3.eth.gas_price
        })

        signed_txn = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        print("----------------------------------------")
        print("Blockchain Write Successful")
        print("Block Number  :", receipt.blockNumber)
        print("Tx Hash       :", receipt.transactionHash.hex())
        print("Gas Used      :", receipt.gasUsed)
        print("========================================")

        return {
            "case_id": case_id,
            "evidence_id": evidence_id,
            "video_hash": video_hash,
            "local_timestamp": local_timestamp,
            "block_number": receipt.blockNumber,
            "transaction_hash": receipt.transactionHash.hex(),
            "gas_used": receipt.gasUsed
        }

    except Exception as e:
        if "Evidence already exists" in str(e):
            print("BLOCKCHAIN_DUPLICATE")
            sys.exit(2)
        else:
            print("BLOCKCHAIN_ERROR:", str(e))
            sys.exit(1)

if __name__ == "__main__":
    insert(sys.argv[1], sys.argv[2], sys.argv[3])
