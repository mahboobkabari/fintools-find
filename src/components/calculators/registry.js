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
import ScssCalculatorWidget from './ScssCalculatorWidget';
import NscCalculatorWidget from './NscCalculatorWidget';
import PomisCalculatorWidget from './PomisCalculatorWidget';
import VpfCalculatorWidget from './VpfCalculatorWidget';
import KvpCalculatorWidget from './KvpCalculatorWidget';
import ApyCalculatorWidget from './ApyCalculatorWidget';
import CompoundInterestCalculatorWidget from './CompoundInterestCalculatorWidget';
import SimpleInterestCalculatorWidget from './SimpleInterestCalculatorWidget';
import XirrCalculatorWidget from './XirrCalculatorWidget';
import InflationCalculatorWidget from './InflationCalculatorWidget';
import GoalSipCalculatorWidget from './GoalSipCalculatorWidget';
import RentVsBuyCalculatorWidget from './RentVsBuyCalculatorWidget';
import FdVsDebtFundCalculatorWidget from './FdVsDebtFundCalculatorWidget';
import HomeAffordabilityCalculatorWidget from './HomeAffordabilityCalculatorWidget';
import DebtSnowballCalculatorWidget from './DebtSnowballCalculatorWidget';
import NetWorthCalculatorWidget from './NetWorthCalculatorWidget';
import BreakEvenCalculatorWidget from './BreakEvenCalculatorWidget';
import LifeInsuranceNeedsCalculatorWidget from './LifeInsuranceNeedsCalculatorWidget';
import DebtToIncomeRatioCalculatorWidget from './DebtToIncomeRatioCalculatorWidget';
import EmergencyFundCalculatorWidget from './EmergencyFundCalculatorWidget';
import RentalYieldCalculatorWidget from './RentalYieldCalculatorWidget';
import DiscountedCashFlowCalculatorWidget from './DiscountedCashFlowCalculatorWidget';
import CreditCardPayoffCalculatorWidget from './CreditCardPayoffCalculatorWidget';
import BalanceTransferCalculatorWidget from './BalanceTransferCalculatorWidget';
import NpvCalculatorWidget from './NpvCalculatorWidget';
import HealthInsuranceCalculatorWidget from './HealthInsuranceCalculatorWidget';
import ProfitMarginCalculatorWidget from './ProfitMarginCalculatorWidget';
import CtcCalculatorWidget from './CtcCalculatorWidget';
import CapRateCalculatorWidget from './CapRateCalculatorWidget';
import PaybackPeriodCalculatorWidget from './PaybackPeriodCalculatorWidget';
import DebtAvalancheCalculatorWidget from './DebtAvalancheCalculatorWidget';
import CashOnCashCalculatorWidget from './CashOnCashCalculatorWidget';
import PropertyValuationCalculatorWidget from './PropertyValuationCalculatorWidget';
import GRMCalculatorWidget from './GRMCalculatorWidget';

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
  'scss-calculator': ScssCalculatorWidget,
  'nsc-calculator': NscCalculatorWidget,
  'pomis-calculator': PomisCalculatorWidget,
  'vpf-calculator': VpfCalculatorWidget,
  'kvp-calculator': KvpCalculatorWidget,
  'apy-calculator': ApyCalculatorWidget,
  'compound-interest-calculator': CompoundInterestCalculatorWidget,
  'simple-interest-calculator': SimpleInterestCalculatorWidget,
  'xirr-calculator': XirrCalculatorWidget,
  'inflation-calculator': InflationCalculatorWidget,
  'goal-sip-calculator': GoalSipCalculatorWidget,
  'rent-vs-buy-calculator': RentVsBuyCalculatorWidget,
  'fd-vs-debt-fund-calculator': FdVsDebtFundCalculatorWidget,
  'home-affordability-calculator': HomeAffordabilityCalculatorWidget,
  'debt-snowball-calculator': DebtSnowballCalculatorWidget,
  'net-worth-calculator': NetWorthCalculatorWidget,
  'break-even-calculator': BreakEvenCalculatorWidget,
  'life-insurance-needs-calculator': LifeInsuranceNeedsCalculatorWidget,
  'debt-to-income-ratio-calculator': DebtToIncomeRatioCalculatorWidget,
  'emergency-fund-calculator': EmergencyFundCalculatorWidget,
  'rental-yield-calculator': RentalYieldCalculatorWidget,
  'discounted-cash-flow-calculator': DiscountedCashFlowCalculatorWidget,
  'credit-card-payoff-calculator': CreditCardPayoffCalculatorWidget,
  'balance-transfer-calculator': BalanceTransferCalculatorWidget,
  'npv-calculator': NpvCalculatorWidget,
  'health-insurance-calculator': HealthInsuranceCalculatorWidget,
  'profit-margin-calculator': ProfitMarginCalculatorWidget,
  'ctc-calculator': CtcCalculatorWidget,
  'cap-rate-calculator': CapRateCalculatorWidget,
  'payback-period-calculator': PaybackPeriodCalculatorWidget,
  'debt-avalanche-calculator': DebtAvalancheCalculatorWidget,
  'cash-on-cash-return-calculator': CashOnCashCalculatorWidget,
  'property-valuation-calculator': PropertyValuationCalculatorWidget,
  'gross-rent-multiplier-calculator': GRMCalculatorWidget,
};

export function getCalculatorWidget(slug) {
  return CALCULATOR_REGISTRY[slug] || null;
}

