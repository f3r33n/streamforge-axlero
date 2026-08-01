import json 
import time 
from truck import Truck
from config import FLEET_SIZE, SIMULATION_INTERVAL

fleet = []

for i in range(FLEET_SIZE):
    fleet.append(Truck(f"TRUCK-{i+1:02d}"))


def publish_telemetry(telemetry):

    with open("telemetry.jsonl", "a") as file:
        json.dump(telemetry, file)
        file.write("\n")

    return telemetry

while True:
    for truck in fleet:

        truck.update()

        telemetry = truck.generate_telemetry()

        print(json.dumps(telemetry, indent=4))

        publish_telemetry(telemetry)

    time.sleep(SIMULATION_INTERVAL)