import random
from datetime import datetime
import uuid
from config import *

class Truck:
    # Initialize a truck with its default operating state
    def __init__(self,truck_id):
        
        self.truck_id=truck_id
        # Assign driver and route information to the truck
        self.driver_id="DRIVER-"+truck_id.split("-")[1]

        route_number = (int(truck_id.split("-")[1]) - 1) % 3 + 1
        self.route_id = f"ROUTE-{route_number:02d}"

        self.latitude=round(random.uniform(18.45, 18.75), 6)

        self.longitude= round(random.uniform(73.75, 74.05), 6)

        self.speed=random.randint(35,45)

        self.fuel=100

        self.temperature=round(random.uniform(25,35),1)


    # Create a telemetry snapshot of the current truck state
    def generate_telemetry(self):
        truck={
            "event_id":str(uuid.uuid4()),
            "truck_id": self.truck_id,
            "driver_id":self.driver_id,
            "route_id":self.route_id,
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
    # Simulate one second of truck movement and state changes
    def update(self):
        #Changing Speed
        speed_change = random.randint(-5, 5)
        self.speed += speed_change
        # Randomly adjust truck speed while keeping it within safe limits
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

    # Check for abnormal operating conditions
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
