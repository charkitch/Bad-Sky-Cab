.PHONY: build-rust serve dev clean help

# Default target
help:
	@echo "Bad Sky Cab - Make Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  build-rust    Build the Rust WASM module"
	@echo "  serve         Start development server"
	@echo "  dev           Build Rust + start server"
	@echo "  clean         Clean build artifacts"
	@echo "  help          Show this help message"

# Build the Rust WASM module
build-rust:
	@echo "Building Rust WASM module..."
	source ~/.cargo/env && wasm-pack build --target web --out-dir pkg rust-game

# Start development server
serve:
	@echo "Starting development server at http://localhost:8000"
	python3 -m http.server 8000

# Build and serve (development workflow)
dev: build-rust serve

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf rust-game/target/
	rm -rf rust-game/pkg/
	@echo "Clean complete!"