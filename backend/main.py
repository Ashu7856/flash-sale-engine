from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Products ka data (in-memory for now)
products = [
    {"id": 1, "name": "Air Max Pro", "emoji": "👟", "price": 1999, "original": 4999, "stock": 47},
    {"id": 2, "name": "Sony WH-1000", "emoji": "🎧", "price": 3999, "original": 9999, "stock": 30},
    {"id": 3, "name": "iPhone Case", "emoji": "📱", "price": 499, "original": 1499, "stock": 100},
]

@app.get("/")
def home():
    return {"message": "Flash Sale API is running!"}

@app.get("/products")
def get_products():
    return products

@app.post("/buy/{product_id}")
def buy_product(product_id: int):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["stock"] <= 0:
        raise HTTPException(status_code=400, detail="Out of stock!")
    product["stock"] -= 1
    return {
        "message": "Successfully added to queue!",
        "product": product["name"],
        "remaining_stock": product["stock"]
    }