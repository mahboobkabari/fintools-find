import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { gratuityCalculatorConfig } from '../../calculators/configs/gratuity-calculator.config.js';

export default function GratuityCalculatorWidget() {
  return <UniversalCalculatorWidget config={gratuityCalculatorConfig} />;
}