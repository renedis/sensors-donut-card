/**
 * Sensor Donut Card for Home Assistant v1.2.0
 * A customizable Lovelace card to display numeric sensors as donut charts
 * Now with manual alignment options!
 */

const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class SensorDonutCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { type: Object }
    };
  }

  setConfig(config) {
    if (!config.donuts || !Array.isArray(config.donuts)) {
      throw new Error("You need to define 'donuts' in your card config");
    }
    this.config = config;
  }

  static get styles() {
    return css`
      .card {
        padding: 16px;
      }
      
      .donuts-container {
        display: grid;
        gap: var(--donut-gap, 16px);
        grid-template-columns: repeat(var(--columns, 1), 1fr);
        justify-items: center;
        align-items: center;
      }
      
      .donut-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        justify-self: center;
        align-self: center;
      }
      
      .donut-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }
      
      .donut-svg {
        transform: rotate(-90deg);
        display: block;
        margin: 0 auto;
        position: relative;
      }
      
      .donut-background {
        fill: none;
        stroke: var(--donut-background-color, #2f3a3f);
        stroke-width: var(--donut-thickness, 8);
      }
      
      .donut-progress {
        fill: none;
        stroke-width: var(--donut-thickness, 8);
        stroke-linecap: round;
        transition: stroke-dasharray 0.4s ease, stroke 0.4s ease;
      }
      
      .donut-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #ccc);
        pointer-events: none;
        width: calc(var(--donut-size, 120px) - var(--donut-thickness, 8px) * 2 - 20px);
        text-align: center;
      }
      
      .donut-value {
        font-size: 16px;
        font-weight: 600;
        line-height: 1;
        display: flex;
        align-items: baseline;
        gap: 2px;
        justify-content: center;
        white-space: nowrap;
      }
      
      .donut-unit {
        font-size: 50%;
        opacity: 0.6;
        color: var(--secondary-text-color, #888);
        font-weight: 400;
      }
      
      .donut-name {
        font-size: 10px;
        margin-top: 2px;
        opacity: 0.8;
        line-height: 1.1;
        word-break: break-word;
        hyphens: auto;
        max-width: 100%;
        overflow-wrap: break-word;
      }
      
      .donut-label {
        margin-top: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color, #888);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        text-align: center;
        max-width: calc(var(--donut-size, 120px) + 20px);
        word-break: break-word;
        hyphens: auto;
      }
      
      .donut-value-external {
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color, #888);
        display: flex;
        align-items: baseline;
        gap: 2px;
        justify-content: center;
        white-space: nowrap;
      }
      
      .positioned-left {
        position: absolute;
        left: -60px;
        top: 50%;
        transform: translateY(-50%);
        text-align: right;
      }
      
      .positioned-right {
        position: absolute;
        right: -60px;
        top: 50%;
        transform: translateY(-50%);
        text-align: left;
      }
      
      .positioned-above {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
      }
      
      .positioned-below {
        margin-top: 8px;
        text-align: center;
      }
      
      .icon {
        margin-right: 6px;
        --mdc-icon-size: 18px;
      }
      
      h1 {
        font-size: 18px;
        margin: 0 0 16px;
        text-align: center;
        color: var(--primary-text-color, #ccc);
      }
      
      .error {
        color: var(--error-color, #ff5252);
        font-size: 14px;
        padding: 8px;
        text-align: center;
      }
      
      /* Size-specific adjustments */
      .size-small .donut-name {
        font-size: 9px;
        line-height: 1.0;
      }
      
      .size-medium .donut-name {
        font-size: 10px;
        line-height: 1.1;
      }
      
      .size-large .donut-name {
        font-size: 11px;
        line-height: 1.2;
      }
      
      /* Manual alignment classes */
      .manual-align {
        position: relative;
      }
    `;
  }

  computeColor(donut, value) {
    if (!donut.color_gradient || donut.color_gradient.length === 0) {
      return "#5cd679"; // default green
    }
    
    const sorted = [...donut.color_gradient].sort((a, b) => b.from - a.from);
    for (const grad of sorted) {
      if (value >= grad.from) return grad.color;
    }
    return sorted[sorted.length - 1].color;
  }

  createDonutPath(size, thickness, percentage) {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    return strokeDasharray;
  }

  renderPositionedElement(content, position, isLabel = false) {
    const baseClass = isLabel ? 'donut-label' : 'donut-value-external';
    
    switch(position) {
      case 'left':
        return html`<div class="${baseClass} positioned-left">${content}</div>`;
      case 'right':
        return html`<div class="${baseClass} positioned-right">${content}</div>`;
      case 'above':
        return html`<div class="${baseClass} positioned-above">${content}</div>`;
      case 'below':
        return html`<div class="${baseClass} positioned-below">${content}</div>`;
      case 'inside':
        return null; // Will be handled in center
      default:
        return html`<div class="${baseClass} positioned-below">${content}</div>`;
    }
  }

  getSizeClass(size) {
    if (size <= 80) return 'size-small';
    if (size <= 140) return 'size-medium';
    return 'size-large';
  }

  parseAlignment(value) {
    if (!value) return '0px';
    if (typeof value === 'string') {
      // Handle string values like '-5px', '5px', '-5', '5'
      if (value.includes('px')) return value;
      return value + 'px';
    }
    if (typeof value === 'number') {
      return value + 'px';
    }
    return '0px';
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const columns = this.config.columns || 1;
    const gap = this.config.gap || 16;

    return html`
      <div class="card">
        ${this.config.title ? html`<h1>${this.config.title}</h1>` : ''}
        <div 
          class="donuts-container" 
          style="--columns: ${columns}; --donut-gap: ${gap}px;"
        >
          ${this.config.donuts.map((donut) => {
            const stateObj = this.hass.states[donut.entity];
            if (!stateObj) {
              return html`<div class="donut-item error">${donut.name} – entity not found</div>`;
            }

            const raw = parseFloat(stateObj.state);
            const value = isNaN(raw) ? 0 : raw;
            const unit = donut.unit !== undefined ? donut.unit : (stateObj.attributes.unit_of_measurement || '');
            const max = donut.max || 100;
            const min = donut.min || 0;
            const size = donut.size || 120;
            const thickness = donut.thickness || 8;
            const showValue = donut.show_value !== false;
            const showName = donut.show_name !== false;
            
            // New positioning options
            const valuePosition = donut.value_position || 'inside';
            const labelPosition = donut.label_position || 'below';
            
            // Manual alignment options
            const alignH = this.parseAlignment(donut['align-h'] || donut.align_h);
            const alignV = this.parseAlignment(donut['align-v'] || donut.align_v);
            const hasManualAlign = alignH !== '0px' || alignV !== '0px';
            
            const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
            const color = this.computeColor(donut, value);
            const backgroundColor = donut.background_color || "#2f3a3f";
            
            const radius = (size - thickness) / 2;
            const strokeDasharray = this.createDonutPath(size, thickness, percentage);
            const sizeClass = this.getSizeClass(size);

            // Calculate exact center coordinates
            const centerX = size / 2;
            const centerY = size / 2;

            // Create value content with separate unit styling
            const valueContent = html`
              ${value}${unit ? html`<span class="donut-unit">${unit}</span>` : ''}
            `;

            // Create label content
            const labelContent = html`
              ${donut.icon ? html`<ha-icon class="icon" icon="${donut.icon}"></ha-icon>` : ''}
              ${donut.name}
            `;

            // Manual alignment styles
            const alignmentStyle = hasManualAlign ? 
              `left: ${alignH}; top: ${alignV};` : '';

            return html`
              <div class="donut-item ${sizeClass} ${hasManualAlign ? 'manual-align' : ''}">
                <div 
                  class="donut-container"
                  style="--donut-size: ${size}px; --donut-thickness: ${thickness}px; ${alignmentStyle}"
                >
                  <svg 
                    class="donut-svg" 
                    width="${size}" 
                    height="${size}"
                    viewBox="0 0 ${size} ${size}"
                    style="--donut-background-color: ${backgroundColor};"
                  >
                    <!-- Background circle -->
                    <circle
                      class="donut-background"
                      cx="${centerX}"
                      cy="${centerY}"
                      r="${radius}"
                      stroke-width="${thickness}"
                    />
                    <!-- Progress circle -->
                    <circle
                      class="donut-progress"
                      cx="${centerX}"
                      cy="${centerY}"
                      r="${radius}"
                      stroke="${color}"
                      stroke-width="${thickness}"
                      stroke-dasharray="${strokeDasharray}"
                      stroke-dashoffset="0"
                    />
                  </svg>
                  
                  <!-- Center content for 'inside' positioning -->
                  ${valuePosition === 'inside' || labelPosition === 'inside' ? html`
                    <div class="donut-center">
                      ${showValue && valuePosition === 'inside' ? html`
                        <div class="donut-value">${valueContent}</div>
                      ` : ''}
                      ${showName && labelPosition === 'inside' ? html`
                        <div class="donut-name">${donut.name}</div>
                      ` : ''}
                    </div>
                  ` : ''}
                  
                  <!-- Positioned elements -->
                  ${showValue && valuePosition !== 'inside' ? 
                    this.renderPositionedElement(valueContent, valuePosition, false) : ''}
                  ${showName && labelPosition !== 'inside' ? 
                    this.renderPositionedElement(labelContent, labelPosition, true) : ''}
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  getCardSize() {
    const rows = Math.ceil(this.config.donuts.length / (this.config.columns || 1));
    return rows * 3 + 1;
  }
}

// Register the custom element
customElements.define('sensor-donut-card', SensorDonutCard);

// Add to window for console access
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sensor-donut-card',
  name: 'Sensor Donut Card',
  description: 'A customizable card to display numeric sensors as donut charts'
});

// Console info
console.info(
  `%c SENSOR-DONUT-CARD %c v1.2.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
