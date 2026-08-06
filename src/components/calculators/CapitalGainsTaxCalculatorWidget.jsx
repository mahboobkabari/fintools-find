import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { capitalGainsTaxCalculatorConfig } from '../../calculators/configs/capital-gains-tax-calculator.config.js';

export default function CapitalGainsTaxCalculatorWidget() {
  return <UniversalCalculatorWidget config={capitalGainsTaxCalculatorConfig} />;
}