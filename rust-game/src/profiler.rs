use serde::{Serialize, Deserialize};
use std::collections::VecDeque;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceStats {
    pub avg: f64,
    pub min: f64,
    pub max: f64,
    pub p95: f64,
    pub variance: f64,
    pub std_dev: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfilerData {
    pub name: String,
    pub runtime: f64,
    pub total_frames: u32,
    pub average_fps: f64,
    pub frame_time: PerformanceStats,
    pub render_time: PerformanceStats,
    pub collision_time: PerformanceStats,
    pub update_time: PerformanceStats,
    pub entity_count: PerformanceStats,
}

pub struct PerformanceProfiler {
    name: String,
    start_time: f64,
    frame_start_time: f64,
    render_start_time: f64,
    collision_start_time: f64,
    update_start_time: f64,
    
    frame_times: VecDeque<f64>,
    render_times: VecDeque<f64>,
    collision_times: VecDeque<f64>,
    update_times: VecDeque<f64>,
    entity_counts: VecDeque<f64>,
    
    total_frames: u32,
    max_samples: usize,
}

impl PerformanceProfiler {
    pub fn new(name: &str) -> Self {
        let start_time = Self::get_time();
        PerformanceProfiler {
            name: name.to_string(),
            start_time,
            frame_start_time: 0.0,
            render_start_time: 0.0,
            collision_start_time: 0.0,
            update_start_time: 0.0,
            frame_times: VecDeque::new(),
            render_times: VecDeque::new(),
            collision_times: VecDeque::new(),
            update_times: VecDeque::new(),
            entity_counts: VecDeque::new(),
            total_frames: 0,
            max_samples: 1000,
        }
    }

    fn get_time() -> f64 {
        let window = web_sys::window().unwrap();
        let performance = window.performance().unwrap();
        performance.now()
    }

    pub fn start_frame(&mut self) {
        self.frame_start_time = Self::get_time();
    }

    pub fn end_frame(&mut self) {
        let frame_time = Self::get_time() - self.frame_start_time;
        self.frame_times.push_back(frame_time);
        self.total_frames += 1;

        if self.frame_times.len() > self.max_samples {
            self.frame_times.pop_front();
        }
    }

    pub fn start_render(&mut self) {
        self.render_start_time = Self::get_time();
    }

    pub fn end_render(&mut self) {
        let render_time = Self::get_time() - self.render_start_time;
        self.render_times.push_back(render_time);

        if self.render_times.len() > self.max_samples {
            self.render_times.pop_front();
        }
    }

    pub fn start_collision_detection(&mut self) {
        self.collision_start_time = Self::get_time();
    }

    pub fn end_collision_detection(&mut self) {
        let collision_time = Self::get_time() - self.collision_start_time;
        self.collision_times.push_back(collision_time);

        if self.collision_times.len() > self.max_samples {
            self.collision_times.pop_front();
        }
    }

    pub fn start_update(&mut self) {
        self.update_start_time = Self::get_time();
    }

    pub fn end_update(&mut self) {
        let update_time = Self::get_time() - self.update_start_time;
        self.update_times.push_back(update_time);

        if self.update_times.len() > self.max_samples {
            self.update_times.pop_front();
        }
    }

    pub fn record_entity_count(&mut self, count: usize) {
        self.entity_counts.push_back(count as f64);

        if self.entity_counts.len() > self.max_samples {
            self.entity_counts.pop_front();
        }
    }

    fn calculate_stats(data: &VecDeque<f64>) -> PerformanceStats {
        if data.is_empty() {
            return PerformanceStats {
                avg: 0.0,
                min: 0.0,
                max: 0.0,
                p95: 0.0,
                variance: 0.0,
                std_dev: 0.0,
            };
        }

        let mut sorted: Vec<f64> = data.iter().cloned().collect();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

        let sum: f64 = data.iter().sum();
        let avg = sum / data.len() as f64;

        // Calculate variance
        let variance = data.iter()
            .map(|x| (x - avg).powi(2))
            .sum::<f64>() / data.len() as f64;

        PerformanceStats {
            avg,
            min: sorted[0],
            max: sorted[sorted.len() - 1],
            p95: sorted[(sorted.len() as f64 * 0.95) as usize],
            variance,
            std_dev: variance.sqrt(),
        }
    }

    pub fn get_stats(&self) -> ProfilerData {
        let runtime = Self::get_time() - self.start_time;
        let average_fps = if runtime > 0.0 {
            (self.total_frames as f64) / (runtime / 1000.0)
        } else {
            0.0
        };

        ProfilerData {
            name: self.name.clone(),
            runtime,
            total_frames: self.total_frames,
            average_fps,
            frame_time: Self::calculate_stats(&self.frame_times),
            render_time: Self::calculate_stats(&self.render_times),
            collision_time: Self::calculate_stats(&self.collision_times),
            update_time: Self::calculate_stats(&self.update_times),
            entity_count: Self::calculate_stats(&self.entity_counts),
        }
    }

    pub fn reset(&mut self) {
        self.start_time = Self::get_time();
        self.total_frames = 0;
        self.frame_times.clear();
        self.render_times.clear();
        self.collision_times.clear();
        self.update_times.clear();
        self.entity_counts.clear();
    }

    pub fn export_json(&self) -> String {
        let stats = self.get_stats();
        serde_json::to_string(&stats).unwrap_or_else(|_| "{}".to_string())
    }
}