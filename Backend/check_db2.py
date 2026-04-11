import motor.motor_asyncio
import asyncio

async def main():
    client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.localize_engine
    docs = await db.projects.find().sort('_id', -1).limit(3).to_list(10)
    for doc in docs:
        print(f"ID:{doc.get('_id')}")
        print(f"  Title: {doc.get('title')}")
        print(f"  Status:{doc.get('status')}")
        print(f"  Stage:{doc.get('stage')}")
        print(f"  Transcript: {str(doc.get('transcript'))[:50]}")
        print("-" * 30)

asyncio.run(main())
