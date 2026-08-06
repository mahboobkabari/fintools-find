import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { fireCalculatorConfig } from '../../calculators/configs/fire-calculator.config.js';

export default function FireCalculatorWidget() {
  return <UniversalCalculatorWidget config={fireCalculatorConfig} />;
}