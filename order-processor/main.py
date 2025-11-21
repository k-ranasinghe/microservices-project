from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import redis
import psycopg2
import json
import time
import threading
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Redis client
r = redis.Redis(host=os.getenv("REDIS_HOST"), port=int(os.getenv("REDIS_PORT")), decode_responses=True)

# Postgres client
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT")),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

# Order schema
class Order(BaseModel):
    id: int
    item: str

@app.post("/enqueue")
async def enqueue_order(order: Order):
    """Add a new order to the Redis queue"""
    r.rpush("orders", order.json())
    return {"message": f"Order {order.id} enqueued"}

@app.get("/health")
async def health_check():
    return {"status": "OK"}

def process_orders():
    print("Order processor started. Waiting for orders...")
    cur = conn.cursor()
    while True:
        order_data = r.lpop("orders")
        if order_data:
            print(f"Processing order: {order_data}")
            order = json.loads(order_data)
            cur.execute("INSERT INTO orders (id, item) VALUES (%s, %s)", (order["id"], order["item"]))
            conn.commit()
            time.sleep(2)
        else:
            time.sleep(1)

# Run background thread when app starts
def start_background_processor():
    t = threading.Thread(target=process_orders, daemon=True)
    t.start()

start_background_processor()
