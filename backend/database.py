from pymongo import MongoClient  # type: ignore
import os
from dotenv import load_dotenv # type: ignore

# Load .env in development ONLY
load_dotenv()

_client = None

def get_db():
    global _client

    if _client is None:
        uri = os.getenv("MONGODB_URI")

        if not uri:
            raise RuntimeError(
                "❌ MONGODB_URI is not set. "
                "Set it in .env (dev) or Vercel env vars (prod)."
            )

        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
        )

        # Verify DB connection immediately
        _client.admin.command("ping")

    return _client["mathmoth"]
