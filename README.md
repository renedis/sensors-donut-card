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
title: System Monitoring       # optional
donuts:
  - name: CPU Fan              # name to show of sensor
    entity: sensor.cpu_fan     # entity to use
    unit: "RPM"                # unit to use
    max: 6000                  # max value to fill the donut chard
    size: 100                  # e.g. 120 or 150 is also possible
    thickness: 4               # how thick the line 
    value_position: inside     # inside/left/right/above/below
    label_position: below      # inside/left/right/above/below
    color_gradient:
      - from: 0                # set base color
        color: "#2ecc71"
      - from: 2000             # change color after this value is reached
        color: "#f1c40f"
      - from: 4500             # change color again after this value is reached
        color: "#e74c3c"
