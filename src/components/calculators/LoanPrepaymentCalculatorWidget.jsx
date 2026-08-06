import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { loanPrepaymentCalculatorConfig } from '../../calculators/configs/loan-prepayment-calculator.config.js';

export default function LoanPrepaymentCalculatorWidget() {
  return <UniversalCalculatorWidget config={loanPrepaymentCalculatorConfig} />;
}