import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { homeLoanCalculatorConfig } from '../../calculators/configs/home-loan-calculator.config.js';

export default function HomeLoanCalculatorWidget() {
  return <UniversalCalculatorWidget config={homeLoanCalculatorConfig} />;
}