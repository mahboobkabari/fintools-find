import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { swpCalculatorConfig } from '../../calculators/configs/swp-calculator.config.js';

export default function SwpCalculatorWidget() {
  return <UniversalCalculatorWidget config={swpCalculatorConfig} />;
}