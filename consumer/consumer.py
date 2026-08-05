from confluent_kafka import Consumer
import json

from consumer.kafka_config import (
    BOOTSTRAP_SERVERS,
    TOPIC_NAME,
    CONSUMER_GROUP,
    AUTO_OFFSET_RESET,
)
consumer_config = {
    "bootstrap.servers": BOOTSTRAP_SERVERS,
    "group.id": CONSUMER_GROUP,
    "auto.offset.reset": AUTO_OFFSET_RESET,
}
consumer = Consumer(consumer_config)

consumer.subscribe([TOPIC_NAME])
try:
    while True:
        message = consumer.poll(1.0)

        if message is None:
            continue

        if message.error():
            print("Error:", message.error())
            continue

        telemetry = json.loads(message.value().decode("utf-8"))

        print("\n===== Telemetry Received =====")
        print(json.dumps(telemetry, indent=4))

except KeyboardInterrupt:
    print("\nConsumer stopped.")

finally:
    consumer.close()