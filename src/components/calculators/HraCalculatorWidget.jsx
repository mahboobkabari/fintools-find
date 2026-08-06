import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { hraCalculatorConfig } from '../../calculators/configs/hra-calculator.config.js';

export default function HraCalculatorWidget() {
  return <UniversalCalculatorWidget config={hraCalculatorConfig} />;
}