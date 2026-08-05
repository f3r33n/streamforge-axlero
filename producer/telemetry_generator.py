import json 
import time 
from producer.truck import Truck
from producer.config import FLEET_SIZE, SIMULATION_INTERVAL
from producer.kafka_producer import publish_to_kafka
# Create the fleet of trucks for the simulation
fleet = []

for i in range(FLEET_SIZE):
    fleet.append(Truck(f"TRUCK-{i+1:02d}"))

# Store generated telemetry.
# This function can later be replaced with Kafka publishing.
def publish_telemetry(telemetry):
    """Publish telemetry data to Kafka."""
    publish_to_kafka("truck-telemetry", telemetry)
    return telemetry

def main():

    """Run the fleet telemetry simulation."""

    # Continuously generate telemetry for every truck in the fleet
    try:
        while True:
            for truck in fleet:
                # Update truck state and generate a new telemetry record

                truck.update()

                telemetry = truck.generate_telemetry()

                print(json.dumps(telemetry, indent=4))

                publish_telemetry(telemetry)

            time.sleep(SIMULATION_INTERVAL)
    except KeyboardInterrupt:
        print("\nStopping telemetry simulation...")

if __name__ == "__main__":
    main()