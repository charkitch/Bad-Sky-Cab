use wasm_bindgen::prelude::*;

mod entities;
mod physics;
mod game_state;
mod background;

use game_state::GameState as InternalGameState;

// Enable logging and panic hooks for debugging
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct GameState {
    state: InternalGameState,
}

#[wasm_bindgen]
impl GameState {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GameState {
        GameState {
            state: InternalGameState::new(),
        }
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        self.state.update();
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
}
