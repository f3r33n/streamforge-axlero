import json 
import time 
from truck import Truck
from config import FLEET_SIZE, SIMULATION_INTERVAL
# Create the fleet of trucks for the simulation
fleet = []

for i in range(FLEET_SIZE):
    fleet.append(Truck(f"TRUCK-{i+1:02d}"))

# Store generated telemetry.
# This function can later be replaced with Kafka publishing.
def publish_telemetry(telemetry):

    with open("telemetry.jsonl", "a") as file:
        json.dump(telemetry, file)
        file.write("\n")

    return telemetry
def main():
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