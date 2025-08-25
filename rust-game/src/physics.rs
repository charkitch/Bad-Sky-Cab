use crate::entities::{Player, Obstacle};

pub struct Physics;

impl Physics {
    pub fn check_collision(player: &Player, obstacle: &Obstacle) -> bool {
        let below_the_top = player.y + player.height > obstacle.y;
        let above_the_bottom = player.y < obstacle.y + obstacle.height;
        let to_the_left_of_right = player.x < obstacle.x + obstacle.width;
        let to_the_right_of_left = player.width + player.x - 2.0 > obstacle.x;

        below_the_top && above_the_bottom && to_the_left_of_right && to_the_right_of_left
    }

    pub fn handle_collision(player: &mut Player, obstacle: &Obstacle) {
        if player.y < obstacle.y {
            player.bounce_up(obstacle);
        } else if player.y > obstacle.y {
            player.bounce_down(obstacle);
        } else if player.x < obstacle.x {
            player.bounce_left(obstacle);
        } else if player.x > obstacle.x {
            player.bounce_right(obstacle);
        }
    }

    pub fn check_game_over(player: &Player, canvas_width: f32, canvas_height: f32) -> bool {
        // Player fell below canvas
        if player.y > canvas_height {
            return true;
        }
        
        // Player went too far left or right
        if canvas_width - player.x - player.width / 2.0 > canvas_width || 
           canvas_width - player.x - player.width / 2.0 < 0.0 {
            return true;
        }

        // Player took too much damage
        if player.damage > 9.0 {
            return true;
        }

        false
    }
}
