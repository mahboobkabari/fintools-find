import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { npsCalculatorConfig } from '../../calculators/configs/nps-calculator.config.js';

export default function NpsCalculatorWidget() {
  return <UniversalCalculatorWidget config={npsCalculatorConfig} />;
}