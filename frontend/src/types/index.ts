export type LoanStatus = "CREATED" | "ACTIVE" | "CLOSED" | "PENDING";

export interface LoanOffer {
  id: string;
  lenderName: string;
  lenderLogo: string;
  interestRate: number;
  creditLimit: number;
  tenureMonths: number;
  esgAdjustment: number;
}

export interface ESGMetrics {
  renewableEnergyPercent: number;
  carbonIntensity: number;
  complianceScore: number;
  wasteRecycledPercent: number;
  socialImpactScore: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  hash: string;
  prevHash: string;
  details: string;
  isTampered?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "BORROWER" | "LENDER";
  businessName?: string;
}
