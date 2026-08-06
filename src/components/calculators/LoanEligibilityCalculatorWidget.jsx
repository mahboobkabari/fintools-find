import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { loanEligibilityCalculatorConfig } from '../../calculators/configs/loan-eligibility-calculator.config.js';

export default function LoanEligibilityCalculatorWidget() {
  return <UniversalCalculatorWidget config={loanEligibilityCalculatorConfig} />;
}