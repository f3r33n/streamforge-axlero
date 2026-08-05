from confluent_kafka import Producer
import json

producer_config = {
    "bootstrap.servers": "localhost:9092"
}

producer = Producer(producer_config)


def publish_to_kafka(topic, telemetry):
    producer.produce(
        topic,
        value=json.dumps(telemetry).encode("utf-8")
    )
    producer.flush()