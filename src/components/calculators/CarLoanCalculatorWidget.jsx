import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { carLoanCalculatorConfig } from '../../calculators/configs/car-loan-calculator.config.js';

export default function CarLoanCalculatorWidget() {
  return <UniversalCalculatorWidget config={carLoanCalculatorConfig} />;
}