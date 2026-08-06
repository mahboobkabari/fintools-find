import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { pensionCalculatorConfig } from '../../calculators/configs/pension-calculator.config.js';

export default function PensionCalculatorWidget() {
  return <UniversalCalculatorWidget config={pensionCalculatorConfig} />;
}