import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { personalLoanCalculatorConfig } from '../../calculators/configs/personal-loan-calculator.config.js';

export default function PersonalLoanCalculatorWidget() {
  return <UniversalCalculatorWidget config={personalLoanCalculatorConfig} />;
}