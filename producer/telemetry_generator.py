import json 
import time 
from truck import Truck

fleet = []

for i in range(5):
    fleet.append(Truck(f"TRUCK-{i+1:02d}"))



while True:
    for truck in fleet:

        truck.update()

        telemetry = truck.generate_telemetry()

        print(json.dumps(telemetry, indent=4))

        with open("telemetry.json", "a") as file:
            json.dump(telemetry, file)
            file.write("\n")

    time.sleep(1)