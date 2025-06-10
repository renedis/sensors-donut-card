# Sensor Donut Card

A customizable Lovelace card to display any numeric sensor as a modern donut chart with gradient colors and flexible positioning options.

## Features

- 🍩 **Modern donut charts** - Clean, animated donut visualizations
- 🎨 **Color gradients** - Define color transitions based on value ranges
- 📊 **Multiple layouts** - Grid layout with configurable columns
- 🎯 **Flexible positioning** - Value and name positioning (center/bottom)
- 📱 **Responsive design** - Adapts to different screen sizes
- ⚡ **Smooth animations** - Animated transitions between values
- 🎛️ **Highly configurable** - Size, thickness, colors, and more

## Installation (via HACS)

1. Go to **HACS → Settings → Custom Repositories**
2. Add this repo:
   - URL: `https://github.com/renedis/sensors-donut-card`
   - Type: `Dashboard`
3. Install the card through HACS
4. Add the card to your dashboard

## Basic Usage

```yaml
type: custom:sensor-donut-card
title: System Monitoring
donuts:
  - name: CPU Usage
    entity: sensor.processor_use
    unit: "%"
    max: 100
    size: 120
    thickness: 12
    color_gradient:
      - from: 0
        color: "#2ecc71"
      - from: 60
        color: "#f1c40f"
      - from: 80
        color: "#e74c3c"
