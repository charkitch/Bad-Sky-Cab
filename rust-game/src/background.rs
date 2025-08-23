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
    pub base_y: f32,        // Original lane position
    pub avoiding: bool,     // Currently avoiding another vehicle
    pub avoid_timer: u32,   // How long to maintain avoidance maneuver
    pub damage: f32,        // Damage this vehicle deals
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
        let base_y = 50.0; // Top traffic lane
        
        // Different damage based on vehicle type
        let damage = match vehicle_types[type_idx] {
            VehicleType::Police => 3.0,
            VehicleType::Delivery => 4.0,
            VehicleType::Taxi => 2.0,
            VehicleType::Civil => 1.5,
        };
        
        BackgroundVehicle {
            x,
            y: base_y,
            width: 40.0,
            height: 20.0,
            speed: 3.0 + (Math::random() * 2.0) as f32, // 3-5 speed
            vehicle_type: vehicle_types[type_idx].clone(),
            moving_right: true,
            base_y,
            avoiding: false,
            avoid_timer: 0,
            damage,
        }
    }

    pub fn new_left_moving(x: f32) -> Self {
        let vehicle_types = [VehicleType::Taxi, VehicleType::Police, VehicleType::Civil, VehicleType::Delivery];
        let type_idx = (Math::random() * 4.0) as usize;
        let base_y = 90.0; // Bottom traffic lane
        
        // Different damage based on vehicle type
        let damage = match vehicle_types[type_idx] {
            VehicleType::Police => 3.0,
            VehicleType::Delivery => 4.0,
            VehicleType::Taxi => 2.0,
            VehicleType::Civil => 1.5,
        };
        
        BackgroundVehicle {
            x,
            y: base_y,
            width: 40.0,
            height: 20.0,
            speed: 2.0 + (Math::random() * 2.0) as f32, // 2-4 speed
            vehicle_type: vehicle_types[type_idx].clone(),
            moving_right: false,
            base_y,
            avoiding: false,
            avoid_timer: 0,
            damage,
        }
    }

    pub fn update(&mut self, other_vehicles: &[BackgroundVehicle]) {
        let my_id = (self.x * 1000.0) as i32 + (self.y * 1000.0) as i32; // Create unique ID
        
        // Check for vehicles to avoid (only slower ones ahead)
        let mut should_avoid = false;
        let avoid_distance = 70.0; // Closer detection distance
        
        for other in other_vehicles {
            let other_id = (other.x * 1000.0) as i32 + (other.y * 1000.0) as i32;
            if my_id == other_id {
                continue; // Skip self using unique ID
            }
            
            // Only avoid vehicles in same direction that are slower
            if self.moving_right == other.moving_right && self.speed > other.speed {
                
                let distance = if self.moving_right {
                    other.x - self.x // Distance to vehicle ahead
                } else {
                    self.x - other.x // Distance to vehicle ahead
                };
                
                // Check if vehicles are in same lane and one is ahead
                let y_overlap = (self.y - other.y).abs() < 30.0; // Tighter lane detection
                
                // If there's a slower vehicle ahead within avoid distance
                if distance > 10.0 && distance < avoid_distance && y_overlap {
                    should_avoid = true;
                    break;
                }
            }
        }
        
        // Handle avoidance maneuvers
        if should_avoid && !self.avoiding {
            self.avoiding = true;
            self.avoid_timer = 60; // Shorter avoidance time for tight maneuver
        }
        
        if self.avoiding {
            self.avoid_timer -= 1;
            
            // Tight avoidance movement - just enough to get around
            let avoid_speed = 1.2; // Gentler movement
            let avoid_direction = if self.base_y < 70.0 { // Top lane
                -avoid_speed // Move up slightly
            } else { // Bottom lane
                avoid_speed // Move down slightly
            };
            
            self.y += avoid_direction;
            
            // Tighter avoidance range - just enough to clear the other car
            self.y = self.y.clamp(self.base_y - 20.0, self.base_y + 20.0);
            
            if self.avoid_timer <= 0 {
                self.avoiding = false;
            }
        } else {
            // Quickly return to base lane when not avoiding
            if (self.y - self.base_y).abs() > 1.0 {
                let return_speed = 0.8; // Gradual return
                if self.y > self.base_y {
                    self.y -= return_speed;
                } else {
                    self.y += return_speed;
                }
            }
        }
        
        // Move horizontally - speed up when avoiding (overtaking)
        let current_speed = if self.avoiding {
            self.speed * 1.3 // 30% speed boost when overtaking
        } else {
            self.speed
        };
        
        if self.moving_right {
            self.x += current_speed;
        } else {
            self.x -= current_speed;
        }
    }
    
    pub fn check_collision_with_player(&self, player_x: f32, player_y: f32, player_width: f32, player_height: f32) -> bool {
        let below_the_top = player_y + player_height > self.y;
        let above_the_bottom = player_y < self.y + self.height;
        let to_the_left_of_right = player_x < self.x + self.width;
        let to_the_right_of_left = player_width + player_x - 2.0 > self.x;

        below_the_top && above_the_bottom && to_the_left_of_right && to_the_right_of_left
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

        // Update traffic vehicles with collision avoidance
        // Process vehicles in multiple passes for better avoidance
        let vehicles_count = self.traffic_vehicles.len();
        for i in 0..vehicles_count {
            let vehicles_snapshot: Vec<BackgroundVehicle> = self.traffic_vehicles.clone();
            self.traffic_vehicles[i].update(&vehicles_snapshot);
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