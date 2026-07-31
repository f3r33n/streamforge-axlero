import random
import json 
import time 
from datetime import datetime

def generate_truck_id():
    return "TRUCK-" + str(random.randint(1, 10)).zfill(2)

def generate_telemetry():
    truck={
        "truck_id":generate_truck_id(),
        "speed":random.randint(0,120),
        "fuel":random.randint(0,100),
        "temperature":random.randint(20,45),
        "latitude":round(random.uniform(18.45,18.75),6),
        "longitude":round(random.uniform(73.75,74.05),6),
        "timestamp":datetime.now().isoformat()

    }

    return truck



while True:
    telemetry = generate_telemetry()
    print(json.dumps(telemetry, indent=4))
    time.sleep(1)