import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { providentFundCalculatorConfig } from '../../calculators/configs/provident-fund-calculator.config.js';

export default function ProvidentFundCalculatorWidget() {
  return <UniversalCalculatorWidget config={providentFundCalculatorConfig} />;
}