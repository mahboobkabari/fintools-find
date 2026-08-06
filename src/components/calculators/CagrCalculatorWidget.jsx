import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { cagrCalculatorConfig } from '../../calculators/configs/cagr-calculator.config.js';

export default function CagrCalculatorWidget() {
  return <UniversalCalculatorWidget config={cagrCalculatorConfig} />;
}