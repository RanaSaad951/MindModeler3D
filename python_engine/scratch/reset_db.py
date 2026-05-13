import sys
from python_engine.config.db import get_db_client

def reset_scans():
    client = get_db_client()
    db = client.get_database()
    coll = db['scans']
    res = coll.update_many({}, {"$set": {"status": "Pending"}})
    print(f"Reset {res.modified_count} scans to Pending.")

if __name__ == "__main__":
    reset_scans()
