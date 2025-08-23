use serde::{Deserialize, Serialize};
use js_sys::Math;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundVehicle {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub speed: f32,
    pub vehicle_type: VehicleType,
    pub moving_right: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VehicleType {
    Taxi,
    Police,
    Civil,
    Delivery,
}

impl BackgroundVehicle {
    pub fn new_right_moving(x: f32) -> Self {
        let vehicle_types = [VehicleType::Taxi, VehicleType::Police, VehicleType::Civil, VehicleType::Delivery];
        let type_idx = (Math::random() * 4.0) as usize;
        
        BackgroundVehicle {
            x,
            y: 50.0, // Top traffic lane
            width: 40.0,
            height: 20.0,
            speed: 3.0 + (Math::random() * 2.0) as f32, // 3-5 speed
            vehicle_type: vehicle_types[type_idx].clone(),
            moving_right: true,
        }
    }

    pub fn new_left_moving(x: f32) -> Self {
        let vehicle_types = [VehicleType::Taxi, VehicleType::Police, VehicleType::Civil, VehicleType::Delivery];
        let type_idx = (Math::random() * 4.0) as usize;
        
        BackgroundVehicle {
            x,
            y: 90.0, // Bottom traffic lane
            width: 40.0,
            height: 20.0,
            speed: 2.0 + (Math::random() * 2.0) as f32, // 2-4 speed
            vehicle_type: vehicle_types[type_idx].clone(),
            moving_right: false,
        }
    }

    pub fn update(&mut self) {
        if self.moving_right {
            self.x += self.speed;
        } else {
            self.x -= self.speed;
        }
    }

    pub fn is_off_screen(&self, canvas_width: f32) -> bool {
        if self.moving_right {
            self.x > canvas_width + 100.0
        } else {
            self.x < -100.0
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Building {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub building_type: BuildingType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BuildingType {
    Tall,
    Wide,
    Medium,
}

impl Building {
    pub fn new(x: f32) -> Self {
        let building_types = [BuildingType::Tall, BuildingType::Wide, BuildingType::Medium];
        let type_idx = (Math::random() * 3.0) as usize;
        
        let (width, height, y) = match &building_types[type_idx] {
            BuildingType::Tall => (40.0, 180.0, 150.0),
            BuildingType::Wide => (80.0, 120.0, 210.0),
            BuildingType::Medium => (60.0, 140.0, 190.0),
        };

        Building {
            x,
            y,
            width,
            height,
            building_type: building_types[type_idx].clone(),
        }
    }

    pub fn update(&mut self, speed: f32) {
        self.x -= speed;
    }

    pub fn is_off_screen(&self) -> bool {
        self.x < -self.width - 50.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundManager {
    pub far_buildings: Vec<Building>,
    pub traffic_vehicles: Vec<BackgroundVehicle>,
    pub far_building_offset: f32,
    pub spawn_timer: u32,
    canvas_width: f32,
}

impl BackgroundManager {
    pub fn new(canvas_width: f32) -> Self {
        let mut manager = BackgroundManager {
            far_buildings: Vec::new(),
            traffic_vehicles: Vec::new(),
            far_building_offset: 0.0,
            spawn_timer: 0,
            canvas_width,
        };

        // Initialize some background buildings
        manager.generate_initial_buildings();
        manager.generate_initial_traffic();
        
        manager
    }

    pub fn update(&mut self) {
        // Update parallax offset for far buildings
        self.far_building_offset -= 0.5; // Slow parallax movement
        if self.far_building_offset < -100.0 {
            self.far_building_offset = 0.0;
        }

        // Update buildings (move them left at slow speed)
        for building in &mut self.far_buildings {
            building.update(1.0); // Slow building movement
        }

        // Remove off-screen buildings and add new ones
        self.far_buildings.retain(|building| !building.is_off_screen());
        self.spawn_buildings_if_needed();

        // Update traffic vehicles
        for vehicle in &mut self.traffic_vehicles {
            vehicle.update();
        }

        // Remove off-screen vehicles and spawn new ones
        self.traffic_vehicles.retain(|vehicle| !vehicle.is_off_screen(self.canvas_width));
        self.spawn_traffic_if_needed();
    }

    fn generate_initial_buildings(&mut self) {
        let mut spawn_x = 0.0;
        for _ in 0..15 {
            let building = Building::new(spawn_x);
            spawn_x += building.width + (Math::random() * 50.0) as f32 + 20.0;
            self.far_buildings.push(building);
        }
    }

    fn generate_initial_traffic(&mut self) {
        // Right-moving traffic lane
        for i in 0..5 {
            let x = (i as f32) * 200.0 + (Math::random() * 100.0) as f32;
            self.traffic_vehicles.push(BackgroundVehicle::new_right_moving(x));
        }

        // Left-moving traffic lane
        for i in 0..5 {
            let x = self.canvas_width - (i as f32) * 200.0 - (Math::random() * 100.0) as f32;
            self.traffic_vehicles.push(BackgroundVehicle::new_left_moving(x));
        }
    }

    fn spawn_buildings_if_needed(&mut self) {
        if let Some(last_building) = self.far_buildings.last() {
            if last_building.x + last_building.width < self.canvas_width + 200.0 {
                let spawn_x = last_building.x + last_building.width + (Math::random() * 50.0) as f32 + 20.0;
                self.far_buildings.push(Building::new(spawn_x));
            }
        }
    }

    fn spawn_traffic_if_needed(&mut self) {
        self.spawn_timer += 1;
        
        // Spawn right-moving vehicles occasionally
        if self.spawn_timer % 120 == 0 && Math::random() < 0.7 {
            self.traffic_vehicles.push(BackgroundVehicle::new_right_moving(-50.0));
        }

        // Spawn left-moving vehicles occasionally
        if self.spawn_timer % 100 == 30 && Math::random() < 0.6 {
            self.traffic_vehicles.push(BackgroundVehicle::new_left_moving(self.canvas_width + 50.0));
        }
    }
}