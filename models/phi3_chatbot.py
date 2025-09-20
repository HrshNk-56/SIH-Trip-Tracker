from gpt4all import GPT4All
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os

# -----------------------
# GPT4All Local Model Path
# -----------------------
MODEL_PATH = os.path.expanduser("C:/Users/Harsh/AppData/Local/nomic.ai/GPT4All")

# Automatically find the first .gguf model in the folder
model_file = None
for file in os.listdir(MODEL_PATH):
    if file.endswith(".gguf") or file.endswith(".bin"):
        model_file = os.path.join(MODEL_PATH, file)
        break

if not model_file:
    raise FileNotFoundError(f"No GGUF or BIN model found in {MODEL_PATH}")

print(f"Loading GPT4All model: {model_file}")
model = GPT4All(model_file)
print("Model loaded successfully!")

# -----------------------
# Chatbot Logic
# -----------------------
chat_histories = {}
MAX_HISTORY = 3  # Keep last 3 exchanges per session


def travel_chatbot(user_input: str, session_id: str = "default") -> str:
    if session_id not in chat_histories:
        chat_histories[session_id] = []

    history = chat_histories[session_id]
    history.append(f"User: {user_input}")

    # Build conversation context
    prompt = "\n".join(history[-(MAX_HISTORY * 2):]) + "\nAssistant:"

    with model.chat_session():
        response = model.generate(prompt, max_tokens=150, temp=0.7)

    history.append(f"Assistant: {response}")
    return response

# -----------------------
# FastAPI Setup
# -----------------------
app = FastAPI(title="GPT4All Phi-3 Chatbot API")


class ChatRequest(BaseModel):
    session_id: str = "default"
    message: str


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    response = travel_chatbot(request.message, request.session_id)
    return {"response": response}


# -----------------------
# Run the API
# -----------------------
if __name__ == "__main__":
    print("Starting API server at http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
