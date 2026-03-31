import motor.motor_asyncio
import asyncio

async def main():
    client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.localize_engine
    doc = await db.projects.find_one({"status": "Failed"}, sort=[('_id', -1)])
    if doc:
        print(f"FAILED DOC ID: {doc['_id']}")
        print(f"Error Stage Message: {doc.get('stage')}")
    else:
        print("No failed docs found.")

asyncio.run(main())
