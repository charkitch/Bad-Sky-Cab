use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub damage: f32,
    pub velocity_x: f32,
    pub velocity_y: f32,
}

impl Player {
    pub fn new() -> Self {
        Player {
            x: 75.0,
            y: 110.0,
            width: 40.0,
            height: 20.0,
            damage: 0.0,
            velocity_x: 0.0,
            velocity_y: 0.0,
        }
    }

    pub fn update(&mut self, input: &InputState) {
        // Reset velocity
        self.velocity_x = 0.0;
        self.velocity_y = 0.0;

        // Apply input to velocity
        if input.right {
            self.velocity_x += 4.0;
        }
        if input.left {
            self.velocity_x -= 2.5;
        }
        if input.up {
            self.velocity_y -= 2.5;
        }
        if input.down {
            self.velocity_y += 4.0;
        }

        // Update position
        self.x += self.velocity_x;
        self.y += self.velocity_y;
    }

    pub fn bounce_up(&mut self, obstacle: &Obstacle) {
        self.y -= 10.0;
        self.damage += obstacle.damage / 4.0;
    }

    pub fn bounce_down(&mut self, obstacle: &Obstacle) {
        self.x -= 20.0;
        self.y += 5.0;
        self.damage += obstacle.damage / 4.0;
    }

    pub fn bounce_left(&mut self, obstacle: &Obstacle) {
        self.x -= 100.0;
        self.damage += obstacle.damage;
    }

    pub fn bounce_right(&mut self, obstacle: &Obstacle) {
        self.x += 10.0;
        self.damage += obstacle.damage / 2.0;
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Obstacle {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub damage: f32,
    pub obstacle_type: ObstacleType,
    pub image_src: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ObstacleType {
    WideTower,
    TallTower,
    FloatingPlatform,
    Train,
    VehicleLeft,
    VehicleRight,
    DeliveryLeft,
    DeliveryRight,
    Billboard,
    BuildingTop,
    Orb, // Add little floating orbs
}

impl Obstacle {
    pub fn new(obstacle_type: ObstacleType, x: f32) -> Self {
        match obstacle_type {
            ObstacleType::WideTower => Obstacle {
                x,
                y: 250.0,
                width: 100.0,
                height: 80.0,
                damage: 8.0,
                obstacle_type,
                image_src: String::from("./assets/images/buildings/wide_building.png"),
            },
            ObstacleType::TallTower => Obstacle {
                x,
                y: 150.0,
                width: 60.0,
                height: 180.0,
                damage: 6.0,
                obstacle_type,
                image_src: String::from("./assets/images/buildings/tall_building.png"),
            },
            ObstacleType::FloatingPlatform => Obstacle {
                x,
                y: 130.0, // Move higher to avoid traffic lanes
                width: 80.0,
                height: 20.0,
                damage: 4.0,
                obstacle_type,
                image_src: String::from(""),
            },
            ObstacleType::Train => Obstacle {
                x,
                y: 200.0,
                width: 120.0,
                height: 40.0,
                damage: 10.0,
                obstacle_type,
                image_src: String::from(""),
            },
            ObstacleType::VehicleLeft => Obstacle {
                x,
                y: 180.0,
                width: 40.0,
                height: 20.0,
                damage: 5.0,
                obstacle_type,
                image_src: String::from(""),
            },
            ObstacleType::VehicleRight => Obstacle {
                x,
                y: 180.0,
                width: 40.0,
                height: 20.0,
                damage: 5.0,
                obstacle_type,
                image_src: String::from(""),
            },
            ObstacleType::DeliveryLeft => Obstacle {
                x,
                y: 170.0,
                width: 50.0,
                height: 30.0,
                damage: 7.0,
                obstacle_type,
                image_src: String::from(""),
            },
            ObstacleType::DeliveryRight => Obstacle {
                x,
                y: 170.0,
                width: 50.0,
                height: 30.0,
                damage: 7.0,
                obstacle_type,
                image_src: String::from(""),
            },
            ObstacleType::Billboard => Obstacle {
                x,
                y: 80.0,
                width: 60.0,
                height: 40.0,
                damage: 3.0,
                obstacle_type,
                image_src: String::from(""),
            },
            ObstacleType::BuildingTop => Obstacle {
                x,
                y: 200.0,
                width: 80.0,
                height: 130.0,
                damage: 6.0,
                obstacle_type,
                image_src: String::from("./assets/images/buildings/tall_building.png"),
            },
            ObstacleType::Orb => Obstacle {
                x,
                y: 120.0 + (js_sys::Math::random() * 60.0) as f32, // Random floating height
                width: 15.0,
                height: 15.0,
                damage: 2.0,
                obstacle_type,
                image_src: String::from(""),
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputState {
    pub right: bool,
    pub left: bool,
    pub up: bool,
    pub down: bool,
}

impl InputState {
    pub fn new() -> Self {
        InputState {
            right: false,
            left: false,
            up: false,
            down: false,
        }
    }
}