from http.server import BaseHTTPRequestHandler
import os
import json
import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

# Load env vars safely
load_dotenv()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body)
            messages = data.get('messages', [])
            requested_model = data.get('modelName', 'gemini-1.5-flash')

            if not messages:
                self.send_error_response(400, "No messages provided")
                return

            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                 api_key = os.environ.get("VITE_GEMINI_API_KEY")

            if not api_key:
                print("Error: GEMINI_API_KEY missing")
                self.send_error_response(500, "Server Configuration Error: Missing API Key")
                return

            genai.configure(api_key=api_key)

            # --- Gemini Logic ---
            gemini_history = []
            system_instruction = None
            last_user_message = ""

            for msg in messages:
                role = msg.get('role')
                content = msg.get('content')
                
                if role == "system":
                    system_instruction = content
                elif role in ["user", "model", "assistant"]:
                    gemini_role = "model" if role == "assistant" else "user"
                    gemini_history.append({"role": gemini_role, "parts": [content]})

            if gemini_history and gemini_history[-1]["role"] == "user":
                last_msg_obj = gemini_history.pop()
                last_user_message = last_msg_obj["parts"][0]
            else:
                self.send_error_response(400, "No user message found")
                return
            
            # Models to try in order of preference
            models_to_try = [
                "gemini-2.0-flash", # Latest Flash
                "gemini-2.0-flash-lite-preview-02-05", 
                "gemini-1.5-flash",
                "gemini-1.5-flash-001",
                "gemini-1.5-flash-8b",
                "gemini-1.5-pro", 
                "gemini-pro"
            ]
            
            # Attempt to respect requested model but put it in the priority list if it's new
            # Actually, standardizing on the hardcoded list is safer for now to ensure we try valid ones.
            # We'll just ignore requested_model if it's "gpt-4o" anyway.

            models_to_try = list(dict.fromkeys(models_to_try))

            response_text = None
            used_model = None
            errors = []

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
                    break # Success
                except Exception as e:
                    error_msg = f"{model_name}: {str(e)}"
                    print(error_msg)
                    errors.append(error_msg)
                    continue

            # --- OPENAI FALLBACK ---
            if not response_text:
                print("Gemini failed or out of quota. Triggering OpenAI fallback...")
                openai_api_key = os.environ.get("OPENAI_API_KEY")
                
                if openai_api_key:
                    try:
                        client = OpenAI(api_key=openai_api_key)
                        
                        # Convert to OpenAI format
                        openai_messages = []
                        if system_instruction:
                            openai_messages.append({"role": "system", "content": system_instruction})
                            
                        for msg in messages:
                            role = msg.get('role')
                            content = msg.get('content')
                            if role != "system":
                                standard_role = "assistant" if role == "model" else "user"
                                openai_messages.append({"role": standard_role, "content": content})
                                
                        completion = client.chat.completions.create(
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
                            # Force wrap it in the expected JSON schema as a python dict stringified
                            response_text = '{"message": ' + json.dumps(fallback_content) + '}'
                            
                        used_model = "gpt-4o-mini (Fallback)"
                    except Exception as oe:
                        error_msg = f"OpenAI Fallback Failed: {str(oe)}"
                        print(error_msg)
                        errors.append(error_msg)
                        # Return ALL errors to help debug
                        raise Exception("All models failed. Details: " + " | ".join(errors))
                else:
                    raise Exception("All models failed. Details: " + " | ".join(errors) + " | No OPENAI_API_KEY for fallback")

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                "response": response_text,
                "debug_model": used_model
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        except Exception as e:
            print(f"Error: {str(e)}")
            self.send_error_response(500, str(e))

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode('utf-8'))
