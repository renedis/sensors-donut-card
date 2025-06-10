import { LitElement, html, css, property, customElement } from 'lit-element';
import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';

interface DonutConfig {
  name: string;
  entity: string;
  unit?: string;
  max?: number;
  min?: number;
  icon?: string;
  color_gradient?: { from: number; color: string }[];
  background_color?: string;
  size?: number;
  thickness?: number;
  show_value?: boolean;
  show_name?: boolean;
  value_position?: 'center' | 'bottom';
  name_position?: 'center' | 'bottom';
}

interface SensorDonutCardConfig extends LovelaceCardConfig {
  title?: string;
  donuts: DonutConfig[];
  columns?: number;
  gap?: number;
}

@customElement('sensor-donut-card')
class SensorDonutCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) private config!: SensorDonutCardConfig;

  setConfig(config: SensorDonutCardConfig) {
    if (!config.donuts || !Array.isArray(config.donuts)) {
      throw new Error("You need to define 'donuts' in your card config");
    }
    this.config = config;
  }

  static styles = css`
    .card {
      padding: 16px;
    }

    .donuts-container {
      display: grid;
      gap: var(--donut-gap, 16px);
      grid-template-columns: repeat(var(--columns, 1), 1fr);
    }

    .donut-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .donut-container {
      position: relative;
      display: inline-block;
    }

    .donut-svg {
      transform: rotate(-90deg);
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
    }

    .donut-value {
      font-size: 16px;
      font-weight: 600;
      line-height: 1;
    }

    .donut-name {
      font-size: 12px;
      margin-top: 4px;
      opacity: 0.8;
    }

    .donut-label {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #ccc);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      margin-right: 6px;
    }

    h1 {
      font-size: 18px;
      margin: 0 0 16px;
      text-align: center;
    }
  `;

  private computeColor(donut: DonutConfig, value: number): string {
    if (!donut.color_gradient || donut.color_gradient.length === 0) {
      return "#5cd679"; // default green
    }

    const sorted = [...donut.color_gradient].sort((a, b) => b.from - a.from);
    for (const grad of sorted) {
      if (value >= grad.from) return grad.color;
    }
    return sorted[sorted.length - 1].color;
  }

  private createDonutPath(size: number, thickness: number, percentage: number): string {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    return strokeDasharray;
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const columns = this.config.columns || 1;
    const gap = this.config.gap || 16;

    return html`
      <div class="card">
        ${this.config.title ? html`<h1>${this.config.title}</h1>` : null}
        <div 
          class="donuts-container" 
          style="--columns: ${columns}; --donut-gap: ${gap}px;"
        >
          ${this.config.donuts.map((donut) => {
            const stateObj = this.hass.states[donut.entity];
            if (!stateObj) {
              return html`<div class="donut-item">${donut.name} – entity not found</div>`;
            }

            const raw = parseFloat(stateObj.state);
            const value = isNaN(raw) ? 0 : raw;
            const unit = donut.unit || stateObj.attributes.unit_of_measurement || '';
            const max = donut.max || 100;
            const min = donut.min || 0;
            const size = donut.size || 120;
            const thickness = donut.thickness || 8;
            const showValue = donut.show_value !== false;
            const showName = donut.show_name !== false;
            const valuePosition = donut.value_position || 'center';
            const namePosition = donut.name_position || 'bottom';

            const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
            const color = this.computeColor(donut, value);
            const backgroundColor = donut.background_color || "#2f3a3f";

            const radius = (size - thickness) / 2;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = this.createDonutPath(size, thickness, percentage);

            return html`
              <div class="donut-item">
                <div class="donut-container">
                  <svg 
                    class="donut-svg" 
                    width="${size}" 
                    height="${size}"
                    style="--donut-thickness: ${thickness}px; --donut-background-color: ${backgroundColor};"
                  >
                    <!-- Background circle -->
                    <circle
                      class="donut-background"
                      cx="${size / 2}"
                      cy="${size / 2}"
                      r="${radius}"
                    />
                    <!-- Progress circle -->
                    <circle
                      class="donut-progress"
                      cx="${size / 2}"
                      cy="${size / 2}"
                      r="${radius}"
                      stroke="${color}"
                      stroke-dasharray="${strokeDasharray}"
                      stroke-dashoffset="0"
                    />
                  </svg>

                  ${valuePosition === 'center' || namePosition === 'center' ? html`
                    <div class="donut-center">
                      ${showValue && valuePosition === 'center' ? html`
                        <div class="donut-value">${value}${unit}</div>
                      ` : null}
                      ${showName && namePosition === 'center' ? html`
                        <div class="donut-name">${donut.name}</div>
                      ` : null}
                    </div>
                  ` : null}
                </div>

                ${(showName && namePosition === 'bottom') || (showValue && valuePosition === 'bottom') ? html`
                  <div class="donut-label">
                    ${donut.icon ? html`<ha-icon class="icon" icon="${donut.icon}"></ha-icon>` : null}
                    <div>
                      ${showName && namePosition === 'bottom' ? html`<div>${donut.name}</div>` : null}
                      ${showValue && valuePosition === 'bottom' ? html`<div>${value}${unit}</div>` : null}
                    </div>
                  </div>
                ` : null}
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
