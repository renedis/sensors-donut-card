import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/sensor-donut-card.ts',
  output: {
    file: 'dist/sensor-donut-card.js',
    format: 'es'
  },
  plugins: [resolve(), typescript()]
};