.PHONY: build-rust serve dev clean help build-and-launch

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
	@echo "  build-and-launch  Build the Rust WASM module and start the server"

# Build the Rust WASM module
build-rust:
	@echo "Building Rust WASM module..."
	source ~/.cargo/env && wasm-pack build --target web --out-dir pkg rust-game

# Start development server
serve:
	@echo "Starting development server at http://localhost:8080"
	python3 -m http.server 8080

# Build and serve (development workflow)
dev: build-rust serve

# Build and launch
build-and-launch: build-rust serve

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf rust-game/target/
	rm -rf rust-game/pkg/
	@echo "Clean complete!"
