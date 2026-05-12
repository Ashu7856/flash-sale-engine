from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from google import genai
import json
import hashlib
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

users_db = {}
orders_db: Dict[str, list] = {}

products = [
    {"id": 1, "name": "Air Max Pro", "emoji": "👟", "price": 1999, "original": 4999, "stock": 47},
    {"id": 2, "name": "Sony WH-1000", "emoji": "🎧", "price": 3999, "original": 9999, "stock": 30},
    {"id": 3, "name": "iPhone Case", "emoji": "📱", "price": 499, "original": 1499, "stock": 100},
]

class UserInput(BaseModel):
    username: str
    password: str

class BuyInput(BaseModel):
    username: str

class ChatInput(BaseModel):
    message: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.get("/")
def home():
    return {"message": "Flash Sale API is running!"}

@app.post("/register")
def register(user: UserInput):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[user.username] = hash_password(user.password)
    return {"message": "Registered successfully!"}

@app.post("/login")
def login(user: UserInput):
    u = users_db.get(user.username)
    if not u or u != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": user.username, "token_type": "bearer"}

@app.get("/products")
def get_products():
    return products

@app.post("/buy/{product_id}")
async def buy_product(product_id: int, buyer: BuyInput):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["stock"] <= 0:
        raise HTTPException(status_code=400, detail="Out of stock!")
    product["stock"] -= 1
    if buyer.username not in orders_db:
        orders_db[buyer.username] = []
    orders_db[buyer.username].append({
        "product_id": product_id,
        "product_name": product["name"],
        "emoji": product["emoji"],
        "price": product["price"],
    })
    await manager.broadcast({"type": "stock_update", "id": product_id, "stock": product["stock"]})
    return {"message": "Successfully added to queue!", "product": product["name"], "remaining_stock": product["stock"]}

@app.get("/orders/{username}")
def get_orders(username: str):
    return orders_db.get(username, [])

@app.post("/chat")
async def chat(input: ChatInput):
    product_context = "\n".join([
        f"- {p['name']} (emoji: {p['emoji']}): Price Rs.{p['price']} (original Rs.{p['original']}), Stock: {p['stock']} left, Discount: {round((1 - p['price']/p['original'])*100)}% off"
        for p in products
    ])
    prompt = f"""You are a helpful AI assistant for a Flash Sale.
Here are the current products on sale:

{product_context}

Answer the user's question based on this product data. Be concise and helpful.
If asked about which product to buy, give a recommendation based on discount and stock.

User question: {input.message}"""

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-1.5-flash-latest",
        contents=prompt
    )
    return {"reply": response.text}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)
