import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { gstCalculatorConfig } from '../../calculators/configs/gst-calculator.config.js';

export default function GstCalculatorWidget() {
  return <UniversalCalculatorWidget config={gstCalculatorConfig} />;
}