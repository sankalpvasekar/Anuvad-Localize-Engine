import asyncio
from app.services.dubbing_service import dubbing_service

async def test_tts():
    # Test Tamil
    text = "இது ஒரு சோதனை" # "This is a test" in Tamil
    print("Testing Tamil TTS...")
    dubbing_service._load_tts("ta")
    path = await dubbing_service._generate_tts(text, "ta", "test")
    print(f"Result path: {path}")

if __name__ == "__main__":
    asyncio.run(test_tts())
