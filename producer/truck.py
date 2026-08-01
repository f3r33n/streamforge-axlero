import random
from datetime import datetime
import uuid
from config import *

class Truck:

    def __init__(self,truck_id):
        
        self.truck_id=truck_id
        self.latitude=round(random.uniform(18.45, 18.75), 6)
        self.longitude= round(random.uniform(73.75, 74.05), 6)
        self.speed=random.randint(35,45)
        self.fuel=100
        self.temperature=round(random.uniform(25,35),1)



    def generate_telemetry(self):
        truck={
            "event_id":str(uuid.uuid4()),
            "truck_id": self.truck_id,
        "speed": self.speed,
        "fuel": self.fuel,
        "temperature": self.temperature,
        "latitude": self.latitude,
        "longitude": self.longitude,
        "status":self.get_status(),
        "alert":self.get_alert(),
        "timestamp": datetime.now().isoformat()
        }  

        return truck

    def update(self):
        #Changing Speed
        speed_change = random.randint(-5, 5)
        self.speed += speed_change

        if self.speed < 0:
            self.speed = 0

        if self.speed > MAX_SPEED:
            self.speed = MAX_SPEED
        #Changing Fuel
        if self.speed == 0:
            consumption = 0
        elif self.speed < 20:
            consumption = 0.005
        elif self.speed < 60:
            consumption = 0.02
        else:
            consumption = 0.04

        self.fuel = round(
            max(0, self.fuel - consumption),
            2
        )
        #Changing Location(Latitude,Longitude)
        if self.speed==0:
            movement=0
        elif self.speed<40:
            movement=0.0001
        elif self.speed<80:
            movement=0.0003
        else:
            movement=0.0005

        self.latitude+=random.uniform(-movement,movement)
        self.longitude+=random.uniform(-movement,movement)

        #Changing Temperature
        if self.speed==0:
            self.temperature -= 0.1
        elif self.speed<40:
            self.temperature += 0.05
        elif self.speed<80:
            self.temperature += 0.1
        else:
            self.temperature += 0.2

        self.temperature=round(max(MIN_TEMPERATURE,min(MAX_TEMPERATURE,self.temperature)),1)



    def get_status(self):
        if self.speed==0:
            return "STOPPED"
        else:
            return "MOVING"


    def get_alert(self):

        alerts=[]

        if self.fuel<LOW_FUEL_THRESHOLD:
            alerts.append("LOW_FUEL")

        if self.temperature>HIGH_TEMPERATURE_THRESHOLD:
            alerts.append("HIGH_ENGINE_TEMPERTURE")

        if self.speed >OVERSPEED_THRESHOLD:
            alerts.append("OVERSPEED")

        if not alerts:
            alerts.append("NORMAL")

        return alerts
