"""
Initialize MongoDB collections for Setu Account Aggregator integration.
Run this script once to create the necessary collections and indexes.

Usage: python init_setu_collections.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_collections():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Initializing Setu Account Aggregator collections...")
    
    # Create setu_consents collection with indexes
    try:
        await db.create_collection("setu_consents")
        print("✓ Created setu_consents collection")
    except Exception as e:
        print(f"  setu_consents collection already exists")
    
    await db.setu_consents.create_index("user_id")
    await db.setu_consents.create_index("consent_id", unique=True)
    await db.setu_consents.create_index("phone_number")
    print("✓ Created indexes for setu_consents")
    
    # Create setu_financial_data collection with indexes
    try:
        await db.create_collection("setu_financial_data")
        print("✓ Created setu_financial_data collection")
    except Exception as e:
        print(f"  setu_financial_data collection already exists")
    
    await db.setu_financial_data.create_index("user_id")
    await db.setu_financial_data.create_index("consent_id")
    await db.setu_financial_data.create_index([("user_id", 1), ("fetched_at", -1)])
    print("✓ Created indexes for setu_financial_data")
    
    print("\n✅ Setu collections initialized successfully!")
    print("\nCollections created:")
    print("  - setu_consents: Stores consent requests and status")
    print("  - setu_financial_data: Stores aggregated financial data from banks/FIPs")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_collections())
