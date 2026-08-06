import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { vatCalculatorConfig } from '../../calculators/configs/vat-calculator.config.js';

export default function VatCalculatorWidget() {
  return <UniversalCalculatorWidget config={vatCalculatorConfig} />;
}