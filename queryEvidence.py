#!/usr/bin/env python3
"""
Query all evidence records from the blockchain
"""

import os
import json
from datetime import datetime, timezone
from web3 import Web3

GANACHE_URL = "http://127.0.0.1:8545"
CONTRACT_ADDRESS = "0xE9d819305b0c24175d1724Bd12E3BC1BCe8983dA"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ABI_PATH = os.path.join(BASE_DIR, "compiled_code.json")

def query_all_evidence():
    """Query all evidence from blockchain"""
    try:
        web3 = Web3(Web3.HTTPProvider(GANACHE_URL))
        if not web3.is_connected():
            raise Exception("Blockchain not connected")

        with open(ABI_PATH) as f:
            compiled_data = json.load(f)
            abi = compiled_data["contracts"]["EvidenceChain.sol"]["EvidenceChain"]["abi"]

        contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

        event_filter = contract.events.EvidenceAdded.create_filter(from_block=0)
        events = event_filter.get_all_entries()

        records = []
        for i, event in enumerate(events, 1):
            timestamp = event['args']['timestamp']
            dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
            
            # Decode bytes fields - indexed strings are stored as bytes32 hashes
            evidence_id = event['args']['evidenceId']
            if isinstance(evidence_id, bytes):
                try:
                    # Try to decode as hex first
                    evidence_id = '0x' + evidence_id.hex()
                except:
                    evidence_id = str(evidence_id)

            record = {
                "number": i,
                "case_id": event['args']['caseId'],
                "evidence_id": evidence_id,
                "hash": event['args']['hash'],
                "timestamp": timestamp,
                "datetime": dt.isoformat() + "Z",
                "block_number": event['blockNumber'],
                "transaction": event['transactionHash'].hex()
            }
            records.append(record)

        print(json.dumps(records, indent=2))

    except Exception as e:
        print(json.dumps([], indent=2))

if __name__ == "__main__":
    query_all_evidence()
