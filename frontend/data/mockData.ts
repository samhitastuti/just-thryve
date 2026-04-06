import { AuditLog, ESGMetrics, LoanOffer } from "../types";

export const MOCK_LOAN_OFFERS: LoanOffer[] = [
  {
    id: "off_1",
    lenderName: "EcoBank India",
    lenderLogo: "https://api.dicebear.com/7.x/initials/svg?seed=EB",
    interestRate: 10.5,
    creditLimit: 2500000,
    tenureMonths: 24,
    esgAdjustment: -0.5,
  },
  {
    id: "off_2",
    lenderName: "GreenFinance Corp",
    lenderLogo: "https://api.dicebear.com/7.x/initials/svg?seed=GF",
    interestRate: 11.2,
    creditLimit: 3000000,
    tenureMonths: 36,
    esgAdjustment: -0.75,
  },
  {
    id: "off_3",
    lenderName: "Standard Credit",
    lenderLogo: "https://api.dicebear.com/7.x/initials/svg?seed=SC",
    interestRate: 12.5,
    creditLimit: 2000000,
    tenureMonths: 12,
    esgAdjustment: 0,
  },
];

export const MOCK_ESG_METRICS: ESGMetrics = {
  renewableEnergyPercent: 65,
  carbonIntensity: 12.4,
  complianceScore: 92,
  wasteRecycledPercent: 45,
  socialImpactScore: 88,
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "blk_1",
    timestamp: "2026-04-01T10:00:00Z",
    event: "Loan Application Created",
    hash: "0000x8f2a...3c1e",
    prevHash: "00000000...0000",
    details: "SME submitted loan application for ₹25,00,000",
  },
  {
    id: "blk_2",
    timestamp: "2026-04-01T10:05:00Z",
    event: "ESG Data Consent Provided",
    hash: "0000x9d1b...4f2a",
    prevHash: "0000x8f2a...3c1e",
    details: "User consented to share GST and Energy data",
  },
  {
    id: "blk_3",
    timestamp: "2026-04-01T10:15:00Z",
    event: "AI Underwriting Completed",
    hash: "0000xa3e4...9b1c",
    prevHash: "0000x9d1b...4f2a",
    details: "ESG-adjusted credit score calculated: 845",
  },
  {
    id: "blk_4",
    timestamp: "2026-04-02T09:00:00Z",
    event: "Lender Offer Accepted",
    hash: "0000xb7c2...1d4e",
    prevHash: "0000xa3e4...9b1c",
    details: "Accepted offer from EcoBank India",
  },
];

export const MOCK_REVENUE_DATA = [
  { month: "Oct", revenue: 450000, emi: 67500 },
  { month: "Nov", revenue: 520000, emi: 78000 },
  { month: "Dec", revenue: 480000, emi: 72000 },
  { month: "Jan", revenue: 610000, emi: 91500 },
  { month: "Feb", revenue: 590000, emi: 88500 },
  { month: "Mar", revenue: 650000, emi: 97500 },
];
