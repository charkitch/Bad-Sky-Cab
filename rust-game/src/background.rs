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
    pub is_being_chased: bool, // If this vehicle is being chased by police
    pub is_chasing: bool,   // If this is a police car chasing someone
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VehicleType {
    Taxi,
    Police,
    Civil,
    Delivery,
    Train,
    PoliceChase, // Rare high-speed police car
    TrafficOrb, // Orbs floating in traffic lanes
}

impl BackgroundVehicle {
    pub fn new_right_moving(x: f32) -> Self {
        // Weighted random selection - trains 5%, orbs 8%, rest regular
        let rand_val = Math::random();
        let vehicle_type = if rand_val < 0.05 {
            VehicleType::Train // 5% chance for trains
        } else if rand_val < 0.13 {
            VehicleType::TrafficOrb // 8% chance for orbs
        } else {
            let regular_types = [VehicleType::Taxi, VehicleType::Civil, VehicleType::Delivery];
            let type_idx = ((rand_val - 0.13) / 0.87 * 3.0) as usize;
            regular_types[type_idx.min(2)].clone()
        };
        
        let base_y = 50.0; // Top traffic lane
        
        // Different properties based on vehicle type
        let (width, height, damage, speed_base, speed_variance) = match vehicle_type {
            VehicleType::Train => (120.0, 25.0, 8.0, 1.5, 0.5), // Long, slow, high damage
            VehicleType::PoliceChase => (40.0, 20.0, 6.0, 6.0, 1.0), // Fast police car - 1.5x player speed
            VehicleType::TrafficOrb => (20.0, 20.0, 3.0, 2.0, 1.5), // Small floating orbs
            VehicleType::Delivery => (45.0, 22.0, 4.0, 2.5, 1.0),
            VehicleType::Taxi => (40.0, 20.0, 2.0, 3.0, 2.0),
            VehicleType::Civil => (38.0, 20.0, 1.5, 3.0, 2.0),
            VehicleType::Police => unreachable!(), // Only PoliceChase now
        };
        
        BackgroundVehicle {
            x,
            y: base_y,
            width,
            height,
            speed: speed_base + (Math::random() * speed_variance) as f32,
            vehicle_type,
            moving_right: true,
            base_y,
            avoiding: false,
            avoid_timer: 0,
            damage,
            is_being_chased: false,
            is_chasing: false,
        }
    }

    pub fn new_left_moving(x: f32) -> Self {
        // Spawn regular vehicles and orbs going left - no trains or police
        let rand_val = Math::random();
        let vehicle_type = if rand_val < 0.15 {
            VehicleType::TrafficOrb // 15% chance for orbs in left lane
        } else {
            let regular_types = [VehicleType::Taxi, VehicleType::Civil, VehicleType::Delivery];
            let type_idx = ((rand_val - 0.15) / 0.85 * 3.0) as usize;
            regular_types[type_idx.min(2)].clone()
        };
        
        let base_y = 90.0; // Bottom traffic lane
        
        // Different properties based on vehicle type - no trains for left-moving
        let (width, height, damage, speed_base, speed_variance) = match vehicle_type {
            VehicleType::TrafficOrb => (20.0, 20.0, 3.0, 1.8, 1.2), // Slower orbs going left
            VehicleType::Delivery => (45.0, 22.0, 4.0, 2.0, 1.0),
            VehicleType::Taxi => (40.0, 20.0, 2.0, 2.5, 1.5),
            VehicleType::Civil => (38.0, 20.0, 1.5, 2.5, 1.5),
            VehicleType::Train => unreachable!(), // Trains only go right
            VehicleType::PoliceChase => unreachable!(), // Police chase only go right
            VehicleType::Police => unreachable!(), // Only PoliceChase now
        };
        
        BackgroundVehicle {
            x,
            y: base_y,
            width,
            height,
            speed: speed_base + (Math::random() * speed_variance) as f32,
            vehicle_type,
            moving_right: false,
            base_y,
            avoiding: false,
            avoid_timer: 0,
            damage,
            is_being_chased: false,
            is_chasing: false,
        }
    }

    pub fn update(&mut self, other_vehicles: &[BackgroundVehicle]) {
        let my_id = (self.x * 1000.0) as i32 + (self.y * 1000.0) as i32; // Create unique ID
        
        // Trains are less likely to avoid others (they're big and have right of way)
        let mut should_avoid = false;
        let avoid_distance = if matches!(self.vehicle_type, VehicleType::Train) {
            50.0 // Trains don't avoid as aggressively
        } else {
            70.0 // Regular vehicles avoid more
        };
        
        for other in other_vehicles {
            let other_id = (other.x * 1000.0) as i32 + (other.y * 1000.0) as i32;
            if my_id == other_id {
                continue; // Skip self using unique ID
            }
            
            // Avoid vehicles in same direction that are slower OR trains (always avoid trains)
            let should_check = if matches!(other.vehicle_type, VehicleType::Train) {
                self.moving_right == other.moving_right // Always avoid trains in same direction
            } else {
                self.moving_right == other.moving_right && self.speed > other.speed // Only avoid slower regular vehicles
            };
            
            if should_check {
                let distance = if self.moving_right {
                    other.x - self.x // Distance to front of vehicle ahead
                } else {
                    self.x - other.x // Distance to front of vehicle ahead
                };
                
                // For trains, also check if we're approaching the back of the train
                let train_back_distance = if self.moving_right {
                    (other.x + other.width) - self.x // Distance to back of train
                } else {
                    self.x - (other.x + other.width) // Distance to back of train
                };
                
                // Check if vehicles are in same lane and one is ahead
                let y_overlap = (self.y - other.y).abs() < 35.0; // Wider detection for trains
                
                // For trains, use larger avoidance distance and check both front and back
                let effective_distance = if matches!(other.vehicle_type, VehicleType::Train) {
                    distance.min(train_back_distance) // Use closest distance to any part of train
                } else {
                    distance
                };
                
                let effective_avoid_distance = if matches!(other.vehicle_type, VehicleType::Train) {
                    avoid_distance * 1.5 // Start avoiding trains earlier
                } else {
                    avoid_distance
                };
                
                // If there's a vehicle ahead within avoid distance
                if effective_distance > 5.0 && effective_distance < effective_avoid_distance && y_overlap {
                    should_avoid = true;
                    break;
                }
            }
        }
        
        // Handle avoidance maneuvers - check if we're avoiding a train for longer duration
        if should_avoid && !self.avoiding {
            self.avoiding = true;
            // Much longer avoidance time to fully clear obstacles
            self.avoid_timer = 120; // Longer avoidance time to clear long trains
        } else if should_avoid && self.avoiding {
            // If still avoiding and still need to avoid, reset timer to continue avoiding
            self.avoid_timer = self.avoid_timer.max(60); // Don't let it drop too low while still avoiding
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
            
            // Only stop avoiding if timer is done AND we're not still detecting obstacles
            if self.avoid_timer <= 0 && !should_avoid {
                self.avoiding = false;
            }
        } else {
            // Very slowly return to base lane when not avoiding to prevent premature returns
            if (self.y - self.base_y).abs() > 1.0 {
                let return_speed = 0.3; // Much slower return to base lane
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
pub struct Billboard {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub billboard_type: BillboardType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BillboardType {
    FirstBreak,
    SecondBreak,
    Security,
    Security2,
    SharkMovie,
}

impl Billboard {
    pub fn new(x: f32) -> Self {
        let billboard_types = [
            BillboardType::FirstBreak,
            BillboardType::SecondBreak,
            BillboardType::Security,
            BillboardType::Security2,
            BillboardType::SharkMovie,
        ];
        let type_idx = (Math::random() * 5.0) as usize;
        
        Billboard {
            x,
            y: -10.0, // Hang at the top like in original
            width: 140.0,
            height: 80.0,
            billboard_type: billboard_types[type_idx.min(4)].clone(),
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
    pub billboards: Vec<Billboard>,
    pub far_building_offset: f32,
    pub spawn_timer: u32,
    canvas_width: f32,
}

impl BackgroundVehicle {
    pub fn new_chase_pair(x: f32) -> (BackgroundVehicle, BackgroundVehicle) {
        let base_y = 50.0;
        let spacing = -80.0; // Police behind target
        
        // Create target vehicle (being chased)
        let target_types = [VehicleType::Civil, VehicleType::Taxi, VehicleType::Delivery];
        let target_type = target_types[(Math::random() * 3.0) as usize].clone();
        
        let (width, height, damage, speed_base, speed_variance) = match target_type {
            VehicleType::Delivery => (45.0, 22.0, 4.0, 4.5, 0.5), // Faster when being chased
            VehicleType::Taxi => (40.0, 20.0, 2.0, 4.2, 0.5),
            VehicleType::Civil => (38.0, 20.0, 1.5, 4.0, 0.5),
            _ => unreachable!(),
        };
        
        let mut target = BackgroundVehicle {
            x,
            y: base_y,
            width,
            height,
            speed: speed_base + (Math::random() * speed_variance) as f32,
            vehicle_type: target_type,
            moving_right: true,
            base_y,
            avoiding: false,
            avoid_timer: 0,
            damage,
            is_being_chased: true,
            is_chasing: false,
        };
        
        // Create police car (chasing)
        let mut police = BackgroundVehicle {
            x: x + spacing,
            y: base_y,
            width: 40.0,
            height: 20.0,
            speed: target.speed + 0.8, // Police slightly faster to catch up
            vehicle_type: VehicleType::PoliceChase,
            moving_right: true,
            base_y,
            avoiding: false,
            avoid_timer: 0,
            damage: 6.0,
            is_being_chased: false,
            is_chasing: true,
        };
        
        (target, police)
    }
}

impl BackgroundManager {
    pub fn new(canvas_width: f32) -> Self {
        let mut manager = BackgroundManager {
            far_buildings: Vec::new(),
            traffic_vehicles: Vec::new(),
            billboards: Vec::new(),
            far_building_offset: 0.0,
            spawn_timer: 0,
            canvas_width,
        };

        // Initialize some background buildings
        manager.generate_initial_buildings();
        manager.generate_initial_traffic();
        manager.generate_initial_billboards();
        
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

        // Update billboards
        for billboard in &mut self.billboards {
            billboard.update(2.0); // Move slightly faster than buildings
        }

        // Remove off-screen buildings and add new ones
        self.far_buildings.retain(|building| !building.is_off_screen());
        self.spawn_buildings_if_needed();

        // Remove off-screen billboards and add new ones
        self.billboards.retain(|billboard| !billboard.is_off_screen());
        self.spawn_billboards_if_needed();

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
        // Start with no traffic - vehicles will spawn during gameplay
    }

    fn generate_initial_billboards(&mut self) {
        // Start with a few billboards with guaranteed spacing
        for i in 0..3 {
            let spacing = 400.0; // Wider spacing to prevent overlaps
            let x = (i as f32) * spacing + (Math::random() * 100.0) as f32;
            self.billboards.push(Billboard::new(x));
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
        
        // More frequent spawning with varied timing
        // Spawn right-moving vehicles or chase pairs
        if self.spawn_timer % 90 == 0 && Math::random() < 0.8 {
            if Math::random() < 0.03 { // 3% chance for chase pair
                let (target, police) = BackgroundVehicle::new_chase_pair(-50.0);
                self.traffic_vehicles.push(target);
                self.traffic_vehicles.push(police);
            } else {
                self.traffic_vehicles.push(BackgroundVehicle::new_right_moving(-50.0));
            }
        }

        // Spawn left-moving vehicles with different timing to avoid synchronization
        if self.spawn_timer % 80 == 40 && Math::random() < 0.75 {
            self.traffic_vehicles.push(BackgroundVehicle::new_left_moving(self.canvas_width + 50.0));
        }

        // Occasionally spawn clusters of vehicles for variety
        if self.spawn_timer % 300 == 0 && Math::random() < 0.3 {
            // Spawn a small convoy
            for i in 0..3 {
                let spacing = 80.0 + (Math::random() * 40.0) as f32;
                if Math::random() < 0.5 {
                    self.traffic_vehicles.push(BackgroundVehicle::new_right_moving(-50.0 - i as f32 * spacing));
                } else {
                    self.traffic_vehicles.push(BackgroundVehicle::new_left_moving(self.canvas_width + 50.0 + i as f32 * spacing));
                }
            }
        }
    }

    fn spawn_billboards_if_needed(&mut self) {
        // Spawn billboards with proper spacing check
        if self.spawn_timer % 600 == 300 && Math::random() < 0.4 {
            let min_spacing = 250.0; // Minimum distance between billboards
            let spawn_x = self.canvas_width + (Math::random() * 200.0) as f32 + 100.0;
            
            // Check if there's enough space from ALL existing billboards
            let can_spawn = self.billboards.iter().all(|existing| {
                let distance = (spawn_x - (existing.x + existing.width)).abs();
                distance > min_spacing || existing.x < -200.0 // Allow if existing is far off screen
            });
            
            if can_spawn {
                self.billboards.push(Billboard::new(spawn_x));
            }
        }
    }
}