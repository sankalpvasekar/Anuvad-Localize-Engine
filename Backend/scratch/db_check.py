from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import json
from bson import ObjectId

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.localize_engine
    col = db.projects
    
    # Get the latest project
    proj = await col.find().sort("created_at", -1).to_list(1)
    if not proj:
        print("No projects found.")
        return
        
    p = proj[0]
    # Convert BSON to JSON serializable
    p['_id'] = str(p['_id'])
    if 'created_at' in p: p['created_at'] = str(p['created_at'])
    
    print(json.dumps({
        "title": p.get("title"),
        "status": p.get("status"),
        "progress": p.get("progress"),
        "stage": p.get("stage"),
        "detected_language": p.get("detected_language"),
        "domain": p.get("domain"),
        "transcript_preview": (p.get("transcript")[:200] + "...") if p.get("transcript") else "None",
        "translations_keys": list(p.get("translations", {}).keys())
    }, indent=2))

if __name__ == "__main__":
    asyncio.run(check())
