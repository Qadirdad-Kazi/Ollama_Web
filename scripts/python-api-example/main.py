import asyncio
import json
import time
from typing import List, Optional
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security (Optional)
security = HTTPBearer(auto_error=False)
API_KEY = os.getenv("API_KEY")

async def verify_api_key(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if API_KEY:
        if not credentials or credentials.credentials != API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API Key")
    return credentials


# Data models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[Message]
    stream: Optional[bool] = False

# Mock model data
MODELS = [
    {
        "name": "custom-python-model",
        "size": 4000000000,
        "digest": "sha256:1234567890abcdef"
    }
]

@app.get("/api/tags")
async def list_models():
    """
    Mimics Ollama's /api/tags endpoint to list available models.
    """
    return {"models": MODELS}

@app.post("/api/chat", dependencies=[Depends(verify_api_key)])
async def chat(request: ChatRequest):
    """
    Mimics Ollama's /api/chat endpoint.
    This is where you would integrate your actual model inference.
    """
    print(f"Received chat request for model: {request.model}")
    print(f"Messages: {request.messages}")

    # TODO: Replace this with your actual model inference logic
    # Example:
    # response_generator = my_model.generate(request.messages)
    
    async def response_generator():
        # Simulate processing time
        await asyncio.sleep(0.5)
        
        # Mock response chunks
        chunks = [
            "Hello", "!", " I", " am", " a", " custom", " Python", " API", 
            " pretending", " to", " be", " Ollama", ".", 
            "\n\n", "You", " said", ":", f" \"{request.messages[-1].content}\""
        ]
        
        for chunk in chunks:
            # Simulate token generation delay
            await asyncio.sleep(0.1)
            
            # Format as Ollama expects
            response_data = {
                "model": request.model,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime()),
                "message": {
                    "role": "assistant",
                    "content": chunk
                },
                "done": False
            }
            yield json.dumps(response_data) + "\n"
        
        # Final "done" message
        final_data = {
            "model": request.model,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime()),
            "done": True,
            "total_duration": 1000000,
            "load_duration": 100000,
            "prompt_eval_count": 10,
            "eval_count": len(chunks),
            "eval_duration": 1000000
        }
        yield json.dumps(final_data) + "\n"

    if request.stream:
        return StreamingResponse(response_generator(), media_type="application/x-ndjson")
    else:
        # Non-streaming response (not implemented in this example, but supported by Ollama)
        return JSONResponse(content={"error": "Only streaming is supported in this example"}, status_code=400)

if __name__ == "__main__":
    import uvicorn
    print("Starting Python API server on http://0.0.0.0:11434")
    uvicorn.run(app, host="0.0.0.0", port=11434)
