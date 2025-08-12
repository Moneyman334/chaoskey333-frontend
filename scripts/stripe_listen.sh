#!/bin/bash

# Stripe Listen Helper Script
# Forwards Stripe webhook events to the local dev server
# Facilitates testing for Stripe-related functionality during development

set -e

# Configuration
DEFAULT_PORT=5000
DEFAULT_WEBHOOK_ENDPOINT="/api/webhook"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT           Local server port (default: $DEFAULT_PORT)"
    echo "  -e, --endpoint ENDPOINT   Webhook endpoint path (default: $DEFAULT_WEBHOOK_ENDPOINT)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  STRIPE_SECRET_KEY        Required: Your Stripe secret key"
    echo ""
    echo "Examples:"
    echo "  $0                       # Use default settings"
    echo "  $0 -p 3000              # Use port 3000"
    echo "  $0 -e /webhooks/stripe  # Use custom endpoint"
}

# Function to validate environment
validate_environment() {
    log_info "Validating environment..."
    
    if [ -z "$STRIPE_SECRET_KEY" ]; then
        log_error "STRIPE_SECRET_KEY environment variable is required"
        log_info "Please set your Stripe secret key:"
        log_info "export STRIPE_SECRET_KEY=sk_test_..."
        exit 1
    fi
    
    if ! command_exists stripe; then
        log_error "Stripe CLI is not installed"
        log_info "Please install Stripe CLI:"
        log_info "macOS: brew install stripe/stripe-cli/stripe"
        log_info "Linux/Windows: https://stripe.com/docs/stripe-cli#install"
        exit 1
    fi
    
    # Test Stripe CLI authentication
    if ! stripe auth >/dev/null 2>&1; then
        log_warning "Stripe CLI may not be authenticated"
        log_info "Please run: stripe login"
    fi
    
    log_success "Environment validation passed"
}

# Function to start Stripe webhook forwarding
start_stripe_listen() {
    local port="$1"
    local endpoint="$2"
    local webhook_url="http://localhost:${port}${endpoint}"
    
    log_info "Starting Stripe webhook forwarding..."
    log_info "Forwarding to: $webhook_url"
    log_info "Press Ctrl+C to stop"
    
    # Create a temporary file to store webhook signing secret
    local temp_file=$(mktemp)
    trap "rm -f $temp_file" EXIT
    
    log_info "Setting up webhook endpoint..."
    
    # Start Stripe listen with event forwarding
    stripe listen \
        --forward-to "$webhook_url" \
        --print-secret > "$temp_file" &
    
    local stripe_pid=$!
    
    # Wait a moment for stripe listen to start
    sleep 3
    
    # Get the webhook signing secret
    local webhook_secret=""
    if [ -f "$temp_file" ]; then
        webhook_secret=$(cat "$temp_file" | grep "whsec_" | head -n1)
    fi
    
    if [ -n "$webhook_secret" ]; then
        log_success "Webhook signing secret: $webhook_secret"
        log_info "Add this to your environment:"
        log_info "export STRIPE_WEBHOOK_SECRET=$webhook_secret"
    else
        log_warning "Could not retrieve webhook signing secret"
    fi
    
    log_success "✅ Stripe webhook forwarding is active"
    log_info "📡 Listening for Stripe events..."
    log_info "💡 Trigger test events with: stripe trigger payment_intent.succeeded"
    
    # Wait for the stripe process
    wait $stripe_pid
}

# Main execution
main() {
    local port="$DEFAULT_PORT"
    local endpoint="$DEFAULT_WEBHOOK_ENDPOINT"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--port)
                port="$2"
                shift 2
                ;;
            -e|--endpoint)
                endpoint="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    log_info "🎯 Stripe Listen Helper for Chaoskey333 Frontend"
    log_info "Port: $port"
    log_info "Endpoint: $endpoint"
    
    validate_environment
    start_stripe_listen "$port" "$endpoint"
}

# Script entry point
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi