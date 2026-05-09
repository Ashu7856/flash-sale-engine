from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import hashlib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

users_db = {}

products = [
    {"id": 1, "name": "Air Max Pro", "emoji": "👟", "price": 1999, "original": 4999, "stock": 47},
    {"id": 2, "name": "Sony WH-1000", "emoji": "🎧", "price": 3999, "original": 9999, "stock": 30},
    {"id": 3, "name": "iPhone Case", "emoji": "📱", "price": 499, "original": 1499, "stock": 100},
]

class UserInput(BaseModel):
    username: str
    password: str

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
async def buy_product(product_id: int):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["stock"] <= 0:
        raise HTTPException(status_code=400, detail="Out of stock!")
    product["stock"] -= 1
    await manager.broadcast({"type": "stock_update", "id": product_id, "stock": product["stock"]})
    return {"message": "Successfully added to queue!", "product": product["name"], "remaining_stock": product["stock"]}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)
