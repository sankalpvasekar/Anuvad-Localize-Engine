import motor.motor_asyncio
import asyncio

async def main():
    db = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017').localize_engine
    await db.projects.delete_many({"title": "test.mp4"})

asyncio.run(main())
