import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { educationLoanCalculatorConfig } from '../../calculators/configs/education-loan-calculator.config.js';

export default function EducationLoanCalculatorWidget() {
  return <UniversalCalculatorWidget config={educationLoanCalculatorConfig} />;
}