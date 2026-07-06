#!/bin/bash

# Exit on error
set -e

echo "Starting Backend..."
cd backend
npm install
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# Catch termination signals to stop both processes gracefully when you press Ctrl+C
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM

echo "Both services are running. Press Ctrl+C to stop."
wait $BACKEND_PID $FRONTEND_PID
