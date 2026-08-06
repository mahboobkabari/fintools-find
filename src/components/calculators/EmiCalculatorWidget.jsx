import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { emiCalculatorConfig } from '../../calculators/configs/emi-calculator.config.js';

export default function EmiCalculatorWidget() {
  return <UniversalCalculatorWidget config={emiCalculatorConfig} />;
}
