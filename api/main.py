from fastapi import FastAPI
from threading import Thread
from confluent_kafka import Consumer
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="StreamForge API")

# Store latest telemetry in memory
latest_telemetry = None
consumer_thread = None
should_stop = False


def consume_telemetry():
    """Background thread that consumes telemetry from Kafka"""
    global latest_telemetry, should_stop
    
    consumer_config = {
        "bootstrap.servers": "localhost:9092",
        "group.id": "streamforge-api",
        "auto.offset.reset": "latest",
    }
    
    consumer = Consumer(consumer_config)
    consumer.subscribe(["truck-telemetry"])
    
    logger.info("Kafka consumer started in background thread")
    
    try:
        while not should_stop:
            message = consumer.poll(1.0)
            
            if message is None:
                continue
            
            if message.error():
                logger.error(f"Kafka error: {message.error()}")
                continue
            
            try:
                latest_telemetry = json.loads(message.value().decode("utf-8"))
                logger.info("Telemetry received and stored")
            except json.JSONDecodeError as e:
                logger.error(f"Failed to decode JSON: {e}")
                continue
    
    except Exception as e:
        logger.error(f"Consumer error: {e}")
    
    finally:
        consumer.close()
        logger.info("Kafka consumer closed")


@app.on_event("startup")
def startup_event():
    """Start the Kafka consumer thread on FastAPI startup"""
    global consumer_thread
    consumer_thread = Thread(target=consume_telemetry, daemon=True)
    consumer_thread.start()
    logger.info("StreamForge API started")


@app.on_event("shutdown")
def shutdown_event():
    """Stop the Kafka consumer thread on FastAPI shutdown"""
    global should_stop
    should_stop = True
    logger.info("StreamForge API shutting down")


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "StreamForge API is running"}


@app.get("/telemetry/latest")
def get_latest_telemetry():
    """Get the latest telemetry received from Kafka"""
    if latest_telemetry is None:
        return {"status": "no telemetry received yet"}
    return latest_telemetry
