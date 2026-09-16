import type { CompanyProfile } from "./contracts";

export const company: CompanyProfile = {
  eori: "213456789456",
  eoriCheckedAt: "8 Sep 2026",
  companyName: "Trusty Company 123",
  vatNumber: "CHE-374.090.316",
  country: "Germany",
  size: "1–50 employees",
  address: "Bösch 82",
  city: "6331 Huenenberg",
  contact: {
    name: "Tony T Theintz",
    role: "CEO",
    email: "tt@trusty.report",
    phone: "079 380 77 50",
  },
  updatedAt: "12 Sep 2026",
  updatedBy: "Tony T Theintz",
};

export const COUNTRIES = ["Germany", "Switzerland", "Netherlands"];
export const COMPANY_SIZES = ["1–50 employees", "51–250 employees", "250+ employees"];
