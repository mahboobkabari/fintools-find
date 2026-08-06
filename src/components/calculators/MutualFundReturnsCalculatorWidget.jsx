import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { mutualFundReturnsCalculatorConfig } from '../../calculators/configs/mutual-fund-returns-calculator.config.js';

export default function MutualFundReturnsCalculatorWidget() {
  return <UniversalCalculatorWidget config={mutualFundReturnsCalculatorConfig} />;
}