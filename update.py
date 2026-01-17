import os
import json
import mysql.connector
from flask import Flask, request, json as flask_json
from flask_cors import CORS
from web3 import Web3
from Crypto.Cipher import Blowfish
from Crypto.Random import get_random_bytes
import requests
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

POLYGON_RPC = "https://rpc-amoy.polygon.technology/"
CHAIN_ID = 80002
CONTRACT_ADDRESS = "0x05eea1F3E401B42f83D73E7c07951E23466DCDf5"

ABI_PATH = "compiled_code.json"

IPFS_API_URL = "http://127.0.0.1:5001/api/v0"

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "forenics"
}

def encrypt_file(input_file, output_file, key):
    cipher = Blowfish.new(key, Blowfish.MODE_ECB)
    with open("static/upload/" + input_file, "rb") as infile, \
         open("static/encrypt/" + output_file, "wb") as outfile:
        while True:
            chunk = infile.read(64)
            if not chunk:
                break
            if len(chunk) % 8 != 0:
                chunk += b' ' * (8 - len(chunk) % 8)
            outfile.write(cipher.encrypt(chunk))
    return upload_file_to_ipfs(output_file)

def upload_file_to_ipfs(filename):
    response = requests.post(
        f"{IPFS_API_URL}/add",
        files={"file": open("static/encrypt/" + filename, "rb")}
    )
    return response.json()["Hash"]

def store_hash_on_polygon(ipfs_hash, sender_address, private_key):
    w3 = Web3(Web3.HTTPProvider(POLYGON_RPC))
    if not w3.is_connected():
        raise Exception("Polygon not connected")

    with open(ABI_PATH) as f:
        abi = json.load(f)["abi"]

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=abi
    )

    nonce = w3.eth.get_transaction_count(sender_address)

    txn = contract.functions.storeHash(ipfs_hash).build_transaction({
        "chainId": CHAIN_ID,
        "from": sender_address,
        "nonce": nonce,
        "gas": 300000,
        "gasPrice": w3.eth.gas_price
    })

    signed_tx = w3.eth.account.sign_transaction(txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    return tx_hash.hex()

@app.route('/forenics/upload', methods=['POST'])
def upload():
    f = request.files['file']
    caseid = request.form['caseid']
    uid = request.form['uid']
    sender_address = request.form['address']
    private_key = request.form['private']

    key = get_random_bytes(8)
    f.save("static/upload/" + f.filename)

    ipfs_hash = encrypt_file(f.filename, "enc_" + f.filename, key)
    tx_hash = store_hash_on_polygon(ipfs_hash, sender_address, private_key)

    db = mysql.connector.connect(**DB_CONFIG)
    cur = db.cursor()

    cur.execute("SELECT IFNULL(MAX(did),0)+1 FROM data")
    did = cur.fetchone()[0]

    cur.execute(
        "INSERT INTO data (did, filename, codeid, keyvalue, caseid) VALUES (%s,%s,%s,%s,%s)",
        (did, f.filename, ipfs_hash, key.hex(), caseid)
    )

    cur.execute("SELECT IFNULL(MAX(td),0)+1 FROM transactiondata")
    td = cur.fetchone()[0]

    cur.execute(
        "INSERT INTO transactiondata (td, trandata, uid, did, alltrans) VALUES (%s,%s,%s,%s,%s)",
        (td, tx_hash, uid, did, "insert")
    )

    db.commit()
    db.close()

    return {"status": "success", "tx_hash": tx_hash}, 200

@app.route('/forenics/login', methods=["POST"])
def login():
    r = request.json
    db = mysql.connector.connect(**DB_CONFIG)
    cur = db.cursor()
    cur.execute(
        "SELECT * FROM users WHERE uid=%s AND password=%s",
        (r["id"], r["password"])
    )
    result = cur.fetchone()
    db.close()
    return flask_json.dumps(result)

if __name__ == '__main__':
    app.run(debug=True)
