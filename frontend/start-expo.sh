#!/bin/bash

echo "🚀 Starting Expo with LAN mode..."
echo "Your local IP: 10.139.129.108"
echo ""
echo "Make sure:"
echo "1. Your phone and laptop are on the same WiFi"
echo "2. Expo Go app is updated to latest version"
echo "3. Firewall allows port 19000"
echo ""
echo "Starting server..."

cd /Users/arnav/Desktop/Spont/frontend
npx expo start --lan --clear


