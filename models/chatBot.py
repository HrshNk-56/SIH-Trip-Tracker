from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os

# -----------------------
# Model Path
# -----------------------
MODEL_PATH = os.path.expanduser("C:/Users/Harsh/AppData/Local/nomic.ai/GPT4All")  # <-- Update if different

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model folder not found: {MODEL_PATH}")

print("Loading Phi-3 Mini Instruct model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# -----------------------
# Load tokenizer and model
# -----------------------
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    device_map="auto" if device == "cuda" else None,
    low_cpu_mem_usage=True
)
print("Model loaded successfully!")

# -----------------------
# Chatbot logic
# -----------------------
chat_histories = {}
MAX_HISTORY = 2  # Keep last 2 exchanges per session


def travel_chatbot(user_input: str, session_id: str = "default") -> str:
    if session_id not in chat_histories:
        chat_histories[session_id] = []

    history = chat_histories[session_id]
    history.append(f"User: {user_input}")
    recent_history = history[-(MAX_HISTORY * 2):]
    prompt = "\n".join(recent_history) + "\nAssistant:"

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    output = model.generate(
        **inputs,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7,
        pad_token_id=tokenizer.eos_token_id,
        num_beams=1,
        early_stopping=True
    )

    bot_response = tokenizer.decode(output[0], skip_special_tokens=True)
    bot_response = bot_response.split("Assistant:")[-1].strip()
    history.append(f"Assistant: {bot_response}")

    return bot_response


# -----------------------
# FastAPI setup
# -----------------------
app = FastAPI(title="Phi-3 Mini Chatbot API")


class ChatRequest(BaseModel):
    session_id: str = "default"
    message: str


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    response = travel_chatbot(request.message, request.session_id)
    return {"response": response}


# -----------------------
# Run API
# -----------------------
if __name__ == "_main_":
    uvicorn.run(app, host="0.0.0.0", port=8000)