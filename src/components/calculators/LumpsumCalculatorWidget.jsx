import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { lumpsumCalculatorConfig } from '../../calculators/configs/lumpsum-calculator.config.js';

export default function LumpsumCalculatorWidget() {
  return <UniversalCalculatorWidget config={lumpsumCalculatorConfig} />;
}