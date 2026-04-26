import motor.motor_asyncio
import asyncio

async def main():
    client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.localize_engine
    docs = await db.projects.find().sort('_id', -1).limit(5).to_list(10)
    for doc in docs:
        print(f"ID:{doc.get('_id')} | Status:{doc.get('status')} | Stage:{doc.get('stage')}")

asyncio.run(main())
