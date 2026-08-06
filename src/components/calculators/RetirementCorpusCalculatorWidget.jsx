import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { retirementCorpusCalculatorConfig } from '../../calculators/configs/retirement-corpus-calculator.config.js';

export default function RetirementCorpusCalculatorWidget() {
  return <UniversalCalculatorWidget config={retirementCorpusCalculatorConfig} />;
}