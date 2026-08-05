"""
Kafka configuration for StreamForge Consumer
"""
BOOTSTRAP_SERVERS = "localhost:9092"
TOPIC_NAME = "truck-telemetry"
CONSUMER_GROUP = "streamforge-consumer-group"
AUTO_OFFSET_RESET = "earliest"