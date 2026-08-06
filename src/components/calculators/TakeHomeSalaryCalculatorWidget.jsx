import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { takeHomeSalaryCalculatorConfig } from '../../calculators/configs/take-home-salary-calculator.config.js';

export default function TakeHomeSalaryCalculatorWidget() {
  return <UniversalCalculatorWidget config={takeHomeSalaryCalculatorConfig} />;
}