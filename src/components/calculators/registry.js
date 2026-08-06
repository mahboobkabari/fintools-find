import EmiCalculatorWidget from './EmiCalculatorWidget';
import SipCalculatorWidget from './SipCalculatorWidget';
import HomeLoanCalculatorWidget from './HomeLoanCalculatorWidget';
import PersonalLoanCalculatorWidget from './PersonalLoanCalculatorWidget';
import LoanAmortizationCalculatorWidget from './LoanAmortizationCalculatorWidget';
import CarLoanCalculatorWidget from './CarLoanCalculatorWidget';
import LoanEligibilityCalculatorWidget from './LoanEligibilityCalculatorWidget';
import LoanPrepaymentCalculatorWidget from './LoanPrepaymentCalculatorWidget';
import EducationLoanCalculatorWidget from './EducationLoanCalculatorWidget';
import LumpsumCalculatorWidget from './LumpsumCalculatorWidget';
import StepUpSipCalculatorWidget from './StepUpSipCalculatorWidget';
import SwpCalculatorWidget from './SwpCalculatorWidget';
import CagrCalculatorWidget from './CagrCalculatorWidget';
import MutualFundReturnsCalculatorWidget from './MutualFundReturnsCalculatorWidget';
import IncomeTaxCalculatorWidget from './IncomeTaxCalculatorWidget';
import GstCalculatorWidget from './GstCalculatorWidget';
import VatCalculatorWidget from './VatCalculatorWidget';
import CapitalGainsTaxCalculatorWidget from './CapitalGainsTaxCalculatorWidget';
import HraCalculatorWidget from './HraCalculatorWidget';
import TdsCalculatorWidget from './TdsCalculatorWidget';
import TakeHomeSalaryCalculatorWidget from './TakeHomeSalaryCalculatorWidget';
import RetirementCorpusCalculatorWidget from './RetirementCorpusCalculatorWidget';
import NpsCalculatorWidget from './NpsCalculatorWidget';
import FourZeroOneKCalculatorWidget from './401kCalculatorWidget';
import ProvidentFundCalculatorWidget from './ProvidentFundCalculatorWidget';
import GratuityCalculatorWidget from './GratuityCalculatorWidget';
import FireCalculatorWidget from './FireCalculatorWidget';
import PensionCalculatorWidget from './PensionCalculatorWidget';

export const CALCULATOR_REGISTRY = {
  'emi-calculator': EmiCalculatorWidget,
  'sip-calculator': SipCalculatorWidget,
  'home-loan-calculator': HomeLoanCalculatorWidget,
  'personal-loan-calculator': PersonalLoanCalculatorWidget,
  'loan-amortization-calculator': LoanAmortizationCalculatorWidget,
  'car-loan-calculator': CarLoanCalculatorWidget,
  'loan-eligibility-calculator': LoanEligibilityCalculatorWidget,
  'loan-prepayment-calculator': LoanPrepaymentCalculatorWidget,
  'education-loan-calculator': EducationLoanCalculatorWidget,
  'lumpsum-calculator': LumpsumCalculatorWidget,
  'step-up-sip-calculator': StepUpSipCalculatorWidget,
  'swp-calculator': SwpCalculatorWidget,
  'cagr-calculator': CagrCalculatorWidget,
  'mutual-fund-returns-calculator': MutualFundReturnsCalculatorWidget,
  'income-tax-calculator': IncomeTaxCalculatorWidget,
  'gst-calculator': GstCalculatorWidget,
  'vat-calculator': VatCalculatorWidget,
  'capital-gains-tax-calculator': CapitalGainsTaxCalculatorWidget,
  'hra-calculator': HraCalculatorWidget,
  'tds-calculator': TdsCalculatorWidget,
  'take-home-salary-calculator': TakeHomeSalaryCalculatorWidget,
  'retirement-corpus-calculator': RetirementCorpusCalculatorWidget,
  'nps-calculator': NpsCalculatorWidget,
  '401k-calculator': FourZeroOneKCalculatorWidget,
  'provident-fund-calculator': ProvidentFundCalculatorWidget,
  'gratuity-calculator': GratuityCalculatorWidget,
  'fire-calculator': FireCalculatorWidget,
  'pension-calculator': PensionCalculatorWidget,
};

export function getCalculatorWidget(slug) {
  return CALCULATOR_REGISTRY[slug] || null;
}
