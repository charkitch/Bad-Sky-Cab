use wasm_bindgen::prelude::*;

mod entities;
mod physics;
mod game_state;
mod background;
mod profiler;

use game_state::GameState as InternalGameState;
use profiler::PerformanceProfiler;

// Enable panic hooks for better error messages
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct GameState {
    state: InternalGameState,
    profiler: Option<PerformanceProfiler>,
    profiling_enabled: bool,
}

#[wasm_bindgen]
impl GameState {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GameState {
        GameState {
            state: InternalGameState::new(),
            profiler: None,
            profiling_enabled: false,
        }
    }

    #[wasm_bindgen]
    pub fn enable_profiling(&mut self) {
        self.profiling_enabled = true;
        self.profiler = Some(PerformanceProfiler::new("Rust WASM Game"));
    }

    #[wasm_bindgen]
    pub fn disable_profiling(&mut self) {
        self.profiling_enabled = false;
        self.profiler = None;
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        if self.profiling_enabled {
            if let Some(ref mut profiler) = self.profiler {
                profiler.start_frame();
                
                // Update phase
                profiler.start_update();
                self.state.update();
                profiler.end_update();
                
                // Record entity counts
                let entity_count = self.state.background.traffic_vehicles.len() 
                    + self.state.background.far_buildings.len()
                    + self.state.background.distant_buildings.len() 
                    + self.state.background.billboards.len()
                    + self.state.obstacles.len();
                profiler.record_entity_count(entity_count);
                
                profiler.end_frame();
            }
        } else {
            self.state.update();
        }
    }

    #[wasm_bindgen]
    pub fn get_state(&self) -> String {
        serde_json::to_string(&self.state).unwrap_or_else(|_| "{}".to_string())
    }

    #[wasm_bindgen]
    pub fn set_input(&mut self, direction: &str, pressed: bool) {
        self.state.set_input(direction, pressed);
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.state.reset();
    }

    #[wasm_bindgen]
    pub fn is_game_over(&self) -> bool {
        self.state.game_over
    }

    #[wasm_bindgen]
    pub fn get_score(&self) -> u32 {
        self.state.score
    }

    #[wasm_bindgen]
    pub fn get_profile_data(&self) -> String {
        if let Some(ref profiler) = self.profiler {
            profiler.export_json()
        } else {
            "{}".to_string()
        }
    }

    #[wasm_bindgen]
    pub fn reset_profiler(&mut self) {
        if let Some(ref mut profiler) = self.profiler {
            profiler.reset();
        }
    }

    #[wasm_bindgen]
    pub fn start_render_profiling(&mut self) {
        if let Some(ref mut profiler) = self.profiler {
            profiler.start_render();
        }
    }

    #[wasm_bindgen]
    pub fn end_render_profiling(&mut self) {
        if let Some(ref mut profiler) = self.profiler {
            profiler.end_render();
        }
    }

    #[wasm_bindgen]
    pub fn start_collision_profiling(&mut self) {
        if let Some(ref mut profiler) = self.profiler {
            profiler.start_collision_detection();
        }
    }

    #[wasm_bindgen]
    pub fn end_collision_profiling(&mut self) {
        if let Some(ref mut profiler) = self.profiler {
            profiler.end_collision_detection();
        }
    }
}
