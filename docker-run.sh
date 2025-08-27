#!/bin/bash
# docker-run.sh - Script para executar o container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="altice-weather-dashboard"
CONTAINER_NAME="altice-weather-app"
PORT=${PORT:-3000}
ENV=${ENV:-production}

echo -e "${BLUE}Altice Weather Dashboard - Docker Runner${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is running"
}

# Function to stop and remove existing container
cleanup_existing() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "Stopping and removing existing container..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        print_success "Cleaned up existing container"
    fi
}

# Function to build Docker image
build_image() {
    print_info "Building Docker image..."
    
    if docker build -t $IMAGE_NAME . ; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to run container
run_container() {
    print_info "Starting container on port $PORT..."
    
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:3500 \
        -e NODE_ENV=$ENV \
        --health-cmd="curl -f http://localhost:3500/health || exit 1" \
        --health-interval=30s \
        --health-timeout=3s \
        --health-retries=3 \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully"
        print_info "Application is running at: http://localhost:$PORT"
        print_info "Health check available at: http://localhost:$PORT/health"
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to show container logs
show_logs() {
    print_info "Showing container logs..."
    docker logs -f $CONTAINER_NAME
}

# Function to show container status
show_status() {
    print_info "Container Status:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    print_info "Health Status:"
    docker inspect $CONTAINER_NAME --format='{{.State.Health.Status}}' 2>/dev/null || echo "Health check not available"
}

# Function to stop container
stop_container() {
    print_info "Stopping container..."
    docker stop $CONTAINER_NAME
    print_success "Container stopped"
}

# Function to remove container and image
remove_all() {
    print_warning "This will remove the container and image. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        docker rmi $IMAGE_NAME 2>/dev/null || true
        print_success "Removed container and image"
    else
        print_info "Operation cancelled"
    fi
}

# Function to show help
show_help() {
    echo -e "${BLUE}Usage: $0 [COMMAND]${NC}"
    echo ""
    echo "Commands:"
    echo "  build     Build the Docker image"
    echo "  run       Run the container (default)"
    echo "  start     Build and run the container"
    echo "  stop      Stop the running container"
    echo "  restart   Restart the container"
    echo "  logs      Show container logs"
    echo "  status    Show container status"
    echo "  clean     Remove container and image"
    echo "  help      Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  PORT      Port to run the application (default: 3000)"
    echo "  ENV       Environment mode (default: production)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  PORT=3500 $0 run"
    echo "  ENV=development $0 start"
}

# Main script logic
case "${1:-run}" in
    "build")
        check_docker
        build_image
        ;;
    "run")
        check_docker
        cleanup_existing
        build_image
        run_container
        ;;
    "start")
        check_docker
        cleanup_existing
        build_image
        run_container
        echo ""
        print_info "Use '$0 logs' to view application logs"
        print_info "Use '$0 stop' to stop the application"
        ;;
    "stop")
        check_docker
        stop_container
        ;;
    "restart")
        check_docker
        stop_container
        sleep 2
        run_container
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "status")
        check_docker
        show_status
        ;;
    "clean")
        check_docker
        remove_all
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac