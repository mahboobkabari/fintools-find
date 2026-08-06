import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { incomeTaxCalculatorConfig } from '../../calculators/configs/income-tax-calculator.config.js';

export default function IncomeTaxCalculatorWidget() {
  return <UniversalCalculatorWidget config={incomeTaxCalculatorConfig} />;
}