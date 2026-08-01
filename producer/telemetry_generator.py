import random
import json 
import time 
from datetime import datetime

truck_state = {
    "truck_id": "TRUCK-01",
    "latitude": 18.520430,
    "longitude": 73.856743,
    "fuel":100.0,
    "speed":40,
    "temperature":30
}

def generate_truck_id():
    return "TRUCK-" + str(random.randint(1, 10)).zfill(2)

def generate_telemetry():
    truck={
        "truck_id":truck_state["truck_id"],
        "speed":truck_state["speed"],
        "fuel":truck_state["fuel"],
        "temperature":truck_state["temperature"],
        "latitude":truck_state["latitude"],
        "longitude":truck_state["longitude"],
        "timestamp":datetime.now().isoformat()

    }
    if truck_state["speed"] == 0:
        truck["status"] = "STOPPED"
    else:
        truck["status"] = "MOVING"
    

    if truck_state["fuel"] < 15:
        truck["alert"] = "LOW_FUEL"
    else:
        truck["alert"] = "NORMAL"


    speed_change = random.randint(-5, 5)
    truck_state["speed"] += speed_change

    if truck_state["speed"] < 0:
        truck_state["speed"] = 0

    if truck_state["speed"] > 120:
        truck_state["speed"] = 120

    



    speed = truck["speed"]

    if speed == 0:
        consumption = 0
    elif speed < 20:
        consumption = 0.005
    elif speed < 60:
        consumption = 0.02
    else:
        consumption = 0.04

    truck_state["fuel"] = round(
    max(0, truck_state["fuel"] - consumption),
    2
    )
    
    

    if truck_state["speed"] == 0:
        truck_state["temperature"] -= 0.1
    elif truck_state["speed"] < 40:
        truck_state["temperature"] += 0.05
    elif truck_state["speed"] < 80:
        truck_state["temperature"] += 0.1
    else:
        truck_state["temperature"] += 0.2

    truck_state["temperature"] = round(
    max(20, min(45, truck_state["temperature"])),
    1
    )
    if truck_state["speed"] == 0:
        movement = 0
    elif truck_state["speed"] < 40:
        movement = 0.0001
    elif truck_state["speed"] < 80:
        movement = 0.0003
    else:
        movement = 0.0005

    truck_state["latitude"] += random.uniform(-movement, movement)
    truck_state["longitude"] += random.uniform(-movement, movement)



    return truck



while True:
    telemetry = generate_telemetry()
    print(json.dumps(telemetry, indent=4))
    with open("telemetry.json", "a") as file:
        json.dump(telemetry, file)
        file.write("\n")
    time.sleep(1)