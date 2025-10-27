#!/bin/bash

echo "=========================================="
echo "Web Archiving System - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "Warning: MongoDB is not installed or not in PATH."
    echo "Please make sure MongoDB is installed and running."
fi

echo "Step 1: Setting up Backend..."
echo "-------------------------------"
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the .env file with your configuration."
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

echo ""
echo "Step 2: Setting up Frontend..."
echo "-------------------------------"
cd ../frontend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "=========================================="
echo "Setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Update backend/.env with your configuration"
echo "3. Seed the database: cd backend && node seed.js"
echo "4. Start the backend: cd backend && npm start"
echo "5. Start the frontend: cd frontend && npm start"
echo ""
echo "Default login credentials:"
echo "  Admin: username=admin, password=admin123"
echo "  Data Entry: username=dataentry, password=data123"
echo "  Archivist: username=archivist, password=archive123"
echo ""
