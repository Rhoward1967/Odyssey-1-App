#!/bin/bash
# Odyssey-1 Lab Startup Script

echo "🚀 Starting Odyssey-1 Lab Environment..."

# Ensure we're on the lab branch
git checkout Odyssey-1-Lab 2>/dev/null || echo "Already on Odyssey-1-Lab branch"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🔧 Starting development server..."
npm run dev &

# Wait a moment for server to start
sleep 5

# Open the preview (this will be handled by VS Code settings)
echo "🌐 Lab environment ready at http://localhost:8081"
echo "✅ Odyssey-1 Lab is ready for development!"