import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { loanAmortizationCalculatorConfig } from '../../calculators/configs/loan-amortization-calculator.config.js';

export default function LoanAmortizationCalculatorWidget() {
  return <UniversalCalculatorWidget config={loanAmortizationCalculatorConfig} />;
}