from pymongo import MongoClient  # type: ignore
import os

_client = None

def get_db():
    global _client
    if _client is None:
        uri = os.environ.get("MONGODB_URI")
        if not uri:
            raise RuntimeError("MONGODB_URI not set")

        _client = MongoClient(uri)
    return _client["mathmoth"]
