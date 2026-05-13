import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Load env from backend/.env
env_path = Path(__file__).resolve().parent.parent / 'backend' / '.env'
load_dotenv(dotenv_path=env_path)

def reset_scans():
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("[Error] MONGO_URI not found in .env")
        return

    client = MongoClient(mongo_uri)
    db = client.get_database()
    scans_collection = db['scans']

    # Match criteria: Find documents with status "Preprocessing Failed" OR "Uploaded"
    query = {
        "status": { "$in": ["Preprocessing Failed", "Uploaded"] }
    }

    # Update action: Set status back to "Pending"
    update = {
        "$set": { "status": "Pending" }
    }

    result = scans_collection.update_many(query, update)
    print(f"[Database Utility] Successfully reset {result.modified_count} scans back to Pending queue.")

if __name__ == "__main__":
    reset_scans()
