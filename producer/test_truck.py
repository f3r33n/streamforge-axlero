from truck import Truck

def test_truck_initialization():
    truck = Truck("TRUCK-01")

    assert truck.truck_id == "TRUCK-01"
    assert truck.fuel >= 0
    assert truck.speed >= 0


def test_generate_telemetry():
    truck = Truck("TRUCK-01")

    telemetry = truck.generate_telemetry()

    assert "truck_id" in telemetry
    assert "speed" in telemetry
    assert "fuel" in telemetry
    assert "temperature" in telemetry
    assert "latitude" in telemetry
    assert "longitude" in telemetry


def test_speed_limits():
    truck = Truck("TRUCK-01")

    for _ in range(100):
        truck.update()

    assert 0 <= truck.speed <= 120


def test_fuel_limits():
    truck = Truck("TRUCK-01")

    for _ in range(1000):
        truck.update()

    assert truck.fuel >= 0