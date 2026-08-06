import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { stepUpSipCalculatorConfig } from '../../calculators/configs/step-up-sip-calculator.config.js';

export default function StepUpSipCalculatorWidget() {
  return <UniversalCalculatorWidget config={stepUpSipCalculatorConfig} />;
}