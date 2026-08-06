import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { sipCalculatorConfig } from '../../calculators/configs/sip-calculator.config.js';

export default function SipCalculatorWidget() {
  return <UniversalCalculatorWidget config={sipCalculatorConfig} />;
}
