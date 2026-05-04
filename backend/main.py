import redis
r = redis.Redis(host="localhost", port=6379, decode_responses=True)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import redis

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connect karo
import os
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
r = redis.from_url(REDIS_URL, decode_responses=True)

# Products ka data
products = [
    {"id": 1, "name": "Air Max Pro", "emoji": "👟", "price": 1999, "original": 4999, "stock": 47},
    {"id": 2, "name": "Sony WH-1000", "emoji": "🎧", "price": 3999, "original": 9999, "stock": 30},
    {"id": 3, "name": "iPhone Case", "emoji": "📱", "price": 499, "original": 1499, "stock": 100},
]

# App start hone pe Redis mein stock set karo
@app.on_event("startup")
def startup():
    for p in products:
        # Sirf tab set karo jab pehle se set nahi hai
        if not r.exists(f"stock:{p['id']}"):
            r.set(f"stock:{p['id']}", p["stock"])

@app.get("/")
def home():
    return {"message": "Flash Sale API is running!"}

@app.get("/products")
def get_products():
    result = []
    for p in products:
        stock = int(r.get(f"stock:{p['id']}") or 0)
        result.append({**p, "stock": stock})
    return result

@app.post("/buy/{product_id}")
def buy_product(product_id: int):
    product = next((p for p in products if p["id"] == product_id), None)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Redis se stock lo
    stock = int(r.get(f"stock:{product_id}") or 0)
    
    if stock <= 0:
        raise HTTPException(status_code=400, detail="Out of stock!")
    
    # Redis mein stock atomically ghata do
    new_stock = r.decr(f"stock:{product_id}")
    
    return {
        "message": "Successfully added to queue!",
        "product": product["name"],
        "remaining_stock": new_stock
    }