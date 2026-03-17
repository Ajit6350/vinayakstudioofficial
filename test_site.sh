#!/bin/bash

# Script ko usi folder mein set karna jahan ye file rakhi hai
cd "$(dirname "$0")"

# User ko batana
echo "🌍 Starting Localhost Server..."
echo "📂 Serving files from: $(pwd)"
echo "------------------------------------------------"

# Browser automatically open karne ka command (Zorin/Linux ke liye)
# 2 second wait karega taaki server start ho jaye
(sleep 2 && xdg-open "http://localhost:8000") &

# Python Server Start karna (Port 8000 par)
python3 -m http.server 8000

# Band karne ke instructions
echo "------------------------------------------------"
read -p "Server band karne ke liye Enter dabayein..."
