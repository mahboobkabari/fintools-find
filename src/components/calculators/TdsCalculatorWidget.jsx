import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { tdsCalculatorConfig } from '../../calculators/configs/tds-calculator.config.js';

export default function TdsCalculatorWidget() {
  return <UniversalCalculatorWidget config={tdsCalculatorConfig} />;
}