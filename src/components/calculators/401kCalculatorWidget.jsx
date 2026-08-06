import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { fourZeroOneKCalculatorConfig } from '../../calculators/configs/401k-calculator.config.js';

export default function FourZeroOneKCalculatorWidget() {
  return <UniversalCalculatorWidget config={fourZeroOneKCalculatorConfig} />;
}