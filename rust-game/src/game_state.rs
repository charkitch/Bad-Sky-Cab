use crate::entities::{Player, Obstacle, ObstacleType, InputState};
use crate::physics::Physics;
use crate::background::BackgroundManager;
use serde::{Deserialize, Serialize};
use js_sys::Math;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub player: Player,
    pub obstacles: Vec<Obstacle>,
    pub background: BackgroundManager,
    pub score: u32,
    pub score_multiplier: u32,
    pub timer: u32,
    pub game_over: bool,
    pub paused: bool,
    pub input: InputState,
    canvas_width: f32,
    canvas_height: f32,
    obstacle_spawn_x: f32,
}

impl GameState {
    pub fn new() -> Self {
        let mut state = GameState {
            player: Player::new(),
            obstacles: Vec::new(),
            background: BackgroundManager::new(900.0),
            score: 0,
            score_multiplier: 2,
            timer: 0,
            game_over: false,
            paused: false,
            input: InputState::new(),
            canvas_width: 900.0,
            canvas_height: 330.0,
            obstacle_spawn_x: 900.0,
        };

        // Initialize some obstacles
        state.generate_initial_obstacles();
        state
    }

    pub fn update(&mut self) {
        if self.game_over || self.paused {
            return;
        }

        // Update background layers
        self.background.update();

        // Update player
        self.player.update(&self.input);

        // Update obstacles (move them left)
        self.update_obstacles();

        // Check collisions
        self.check_collisions();

        // Check traffic vehicle collisions with player
        self.check_traffic_collisions();

        // Check game over conditions
        if Physics::check_game_over(&self.player, self.canvas_width, self.canvas_height) {
            self.game_over = true;
        }

        // Update score
        self.update_score();

        // Spawn new obstacles as needed
        self.spawn_obstacles();
    }

    fn update_obstacles(&mut self) {
        for obstacle in &mut self.obstacles {
            obstacle.x -= 2.0; // Move obstacles left
        }

        // Remove obstacles that are off-screen
        self.obstacles.retain(|obstacle| obstacle.x + obstacle.width > -100.0);
    }

    fn check_collisions(&mut self) {
        for obstacle in &self.obstacles {
            if Physics::check_collision(&self.player, obstacle) {
                Physics::handle_collision(&mut self.player, obstacle);
            }
        }
    }

    fn check_traffic_collisions(&mut self) {
        for vehicle in &self.background.traffic_vehicles {
            if vehicle.check_collision_with_player(
                self.player.x,
                self.player.y,
                self.player.width,
                self.player.height
            ) {
                // Apply damage from traffic vehicle
                self.player.damage += vehicle.damage;
                
                // Push player away from vehicle (similar to obstacle collision)
                if self.player.y < vehicle.y {
                    self.player.y -= 10.0;
                } else if self.player.y > vehicle.y {
                    self.player.y += 5.0;
                    self.player.x -= 15.0;
                } else if self.player.x < vehicle.x {
                    self.player.x -= 25.0;
                } else if self.player.x > vehicle.x {
                    self.player.x += 10.0;
                }
                
                // Only handle one collision per frame to avoid multiple damage
                break;
            }
        }
    }

    fn update_score(&mut self) {
        if self.timer == 1000 {
            self.score_multiplier *= 2;
            self.timer = 0;
        }
        self.score += 1 * self.score_multiplier;
        self.timer += 1;
    }

    fn spawn_obstacles(&mut self) {
        // Get the rightmost obstacle position
        let rightmost_x = self.obstacles.iter()
            .map(|o| o.x + o.width)
            .fold(0.0f32, |a, b| a.max(b));

        // Spawn new obstacles if there's enough space
        if rightmost_x < self.canvas_width + 200.0 {
            if let Some(obstacle) = self.random_obstacle() {
                self.obstacles.push(obstacle);
            }
        }
    }

    fn generate_initial_obstacles(&mut self) {
        let mut spawn_x = self.canvas_width;
        for _ in 0..10 {
            if let Some(mut obstacle) = self.random_obstacle() {
                obstacle.x = spawn_x;
                spawn_x += obstacle.width + (Math::random() * 100.0) as f32 + 50.0;
                self.obstacles.push(obstacle);
            }
        }
    }

    fn random_obstacle(&self) -> Option<Obstacle> {
        let rand_val = (Math::random() * 100.0) as u32;
        let obstacle_type = match rand_val {
            0..=12 => ObstacleType::WideTower,
            13..=29 => ObstacleType::TallTower,
            30..=39 => ObstacleType::FloatingPlatform,
            40..=54 => ObstacleType::Train,
            55..=67 => ObstacleType::VehicleLeft,
            68..=81 => ObstacleType::VehicleRight,
            82..=84 => ObstacleType::DeliveryRight,
            85..=87 => ObstacleType::DeliveryLeft,
            88..=92 => ObstacleType::Billboard,
            93..=99 => ObstacleType::BuildingTop,
            _ => return None,
        };

        Some(Obstacle::new(obstacle_type, self.obstacle_spawn_x + (Math::random() * 200.0) as f32))
    }

    pub fn set_input(&mut self, direction: &str, pressed: bool) {
        match direction {
            "right" => self.input.right = pressed,
            "left" => self.input.left = pressed,
            "up" => self.input.up = pressed,
            "down" => self.input.down = pressed,
            _ => {}
        }
    }

    pub fn reset(&mut self) {
        *self = GameState::new();
    }
}