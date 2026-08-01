import random
import json 
import time 
from datetime import datetime

truck_state = {
    "truck_id": "TRUCK-01",
    "latitude": 18.520430,
    "longitude": 73.856743,
    "fuel":100
}

def generate_truck_id():
    return "TRUCK-" + str(random.randint(1, 10)).zfill(2)

def generate_telemetry():
    truck={
        "truck_id":truck_state["truck_id"],
        "speed":random.randint(0,120),
        "fuel":truck_state["fuel"],
        "temperature":random.randint(20,45),
        "latitude":truck_state["latitude"],
        "longitude":truck_state["longitude"],
        "timestamp":datetime.now().isoformat()

    }

    speed = truck["speed"]

    if speed == 0:
        consumption = 0
    elif speed < 20:
        consumption = 0.005
    elif speed < 60:
        consumption = 0.02
    else:
        consumption = 0.04

    truck_state["fuel"] = max(0, truck_state["fuel"] - consumption)
    
    truck_state["latitude"] += random.uniform(-0.0005, 0.0005)

    truck_state["longitude"] += random.uniform(-0.0005, 0.0005)

    return truck



while True:
    telemetry = generate_telemetry()
    print(json.dumps(telemetry, indent=4))
    time.sleep(1)