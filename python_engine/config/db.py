import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Load env from backend/.env
env_path = Path(__file__).resolve().parent.parent.parent / 'backend' / '.env'
load_dotenv(dotenv_path=env_path)

def get_db_client():
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise ValueError("MONGO_URI not found in environment variables")
    
    client = MongoClient(mongo_uri)
    return client

def get_pending_scans():
    client = get_db_client()
    db = client.get_database() # Uses database name from URI or default
    scans_collection = db['scans']
    
    # Fetch scans that are pending processing
    return list(scans_collection.find({"status": "Pending"}))

def update_scan_status(scan_id, status, metadata=None):
    client = get_db_client()
    db = client.get_database()
    scans_collection = db['scans']
    
    update_data = {"$set": {"status": status}}
    if metadata:
        update_data["$set"].update(metadata)
        
    scans_collection.update_one({"_id": scan_id}, update_data)
