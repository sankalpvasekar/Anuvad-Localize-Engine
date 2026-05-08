# Localize Engine

## 🎥 YouTube Demo
[Add YouTube video link here after upload]

## Project Description
Localize Engine is a comprehensive neural localization platform designed to automate the process of translating and dubbing video content. It leverages state-of-the-art AI models for speech-to-text (Whisper), machine translation (IndicTrans2), and voice synthesis to provide high-quality localized output. The system is specifically optimized for Indian languages, offering RAG-enhanced translation to maintain context and technical accuracy.

## Tech Stack
### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor)
- **AI Models**:
  - **Speech-to-Text**: OpenAI Whisper (large-v3)
  - **Translation**: IndicTrans2, IBM Granite 3.0
  - **LLM/RAG**: Sentence Transformers, FAISS
- **Processing**: FFmpeg, Torch, Librosa

### Frontend
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## How to Run
### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB (running locally or URI in .env)
- FFmpeg (executable in path or in project directory)

### Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sankalpvasekar/Anuvad-Localize-Engine.git
   cd Anuvad-Localize-Engine
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   python -m venv .venv
   .\.venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   ```bash
   cd ../Frontend
   npm install
   ```

### Execution
Run the provided batch script to start both servers simultaneously:
```bash
.\run_project.bat
```
Alternatively, start them manually:
- **Backend**: `cd Backend && uvicorn app.main:app --reload`
- **Frontend**: `cd Frontend && npm run dev`

## Local Server (Optional)
The backend API is accessible at `http://localhost:8000` with interactive docs at `/docs`.
The frontend dev server runs at `http://localhost:5173`.
