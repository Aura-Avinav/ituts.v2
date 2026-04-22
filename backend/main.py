from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import google.generativeai as genai
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables from .env file (if exists in root or backend)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class GenerateRequest(BaseModel):
    messages: List[Message]
    modelName: Optional[str] = "gemini-1.5-flash"

@app.post("/api/generate")
async def generate_response(request: GenerateRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = os.getenv("VITE_GEMINI_API_KEY")
        
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not found in environment variables.")

    genai.configure(api_key=api_key)

    try:
        gemini_history = []
        system_instruction = None
        last_user_message = ""

        for msg in request.messages:
            if msg.role == "system":
                system_instruction = msg.content
            elif msg.role == "user" or msg.role == "model" or msg.role == "assistant":
                role = "model" if msg.role == "assistant" else "user"
                gemini_history.append({"role": role, "parts": [msg.content]})

        if gemini_history and gemini_history[-1]["role"] == "user":
            last_msg_obj = gemini_history.pop()
            last_user_message = last_msg_obj["parts"][0]
        else:
            raise HTTPException(status_code=400, detail="No user message found at the end of history.")

        # Models to try in order of preference
        models_to_try = [
            "gemini-2.0-flash", # Latest Flash
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            request.modelName, 
            "gemini-1.5-flash-001",
            "gemini-1.5-pro", 
            "gemini-pro"
        ]
        
        # Remove duplicates while preserving order
        models_to_try = list(dict.fromkeys(models_to_try))

        response_text = None
        used_model = None
        last_error = None

        for model_name in models_to_try:
            try:
                if not model_name or "gpt" in model_name: 
                    continue

                print(f"Trying model: {model_name}")
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )

                chat = model.start_chat(history=gemini_history)
                response = chat.send_message(last_user_message)

                response_text = response.text
                used_model = model_name
                break
            except Exception as e:
                print(f"Model {model_name} failed: {e}")
                last_error = e
                continue
        
        # --- OPENAI FALLBACK ---
        if not response_text:
            print("Gemini failed or out of quota. Triggering OpenAI fallback...")
            openai_api_key = os.getenv("OPENAI_API_KEY")
            
            if openai_api_key:
                try:
                    client = AsyncOpenAI(api_key=openai_api_key)
                    
                    # Convert Gemini history to OpenAI format
                    openai_messages = []
                    if system_instruction:
                        openai_messages.append({"role": "system", "content": system_instruction})
                        
                    for msg in request.messages:
                        if msg.role != "system":
                            # standardize role name
                            role = "assistant" if msg.role == "model" else "user"
                            openai_messages.append({"role": role, "content": msg.content})
                            
                    completion = await client.chat.completions.create(
                        model="gpt-4o-mini",
                        response_format={ "type": "json_object" },
                        messages=openai_messages
                    )
                    
                    fallback_content = completion.choices[0].message.content
                    
                    # Ensure it's valid JSON for the frontend
                    try:
                        json.loads(fallback_content)
                        response_text = fallback_content
                    except json.JSONDecodeError:
                        # Force wrap it in the expected JSON schema as a string containing JSON
                        response_text = '{"message": ' + json.dumps(fallback_content) + '}'
                        
                    used_model = "gpt-4o-mini (Fallback)"
                except Exception as oe:
                    print(f"OpenAI fallback failed: {oe}")
                    # Retain original Gemini error if fallback fails
                    raise last_error or HTTPException(status_code=500, detail="All models failed (including fallback)")
            else:
                raise last_error or HTTPException(status_code=500, detail="All Google models failed and no OPENAI_API_KEY available for fallback.")

        return {
            "response": response_text,
            "debug_model": used_model
        }

    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
