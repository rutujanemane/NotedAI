#!/bin/bash
# This script generates placeholder icons for the Chrome extension

# Create simple colored circle icons with "N" text for NotedAI
# Note: In a real implementation, you would create proper icons
# For the hackathon, these placeholder icons will work

# Create a simple SVG icon
cat > icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="60" fill="#0284c7" />
  <text x="64" y="80" font-family="Arial" font-size="70" font-weight="bold" text-anchor="middle" fill="white">N</text>
</svg>
SVG

# Convert SVG to PNG at different sizes
# In a real implementation, you'd use proper tools like Inkscape or ImageMagick
# For the hackathon, you can manually create these icons or use online tools

echo "Please create icon16.png, icon48.png, and icon128.png from the SVG template."
echo "You can use online tools like https://convertio.co/svg-png/ or desktop tools like Inkscape."
