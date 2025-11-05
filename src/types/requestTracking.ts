// Types for tracking public records requests

import { type StateCode } from "@/data/legalDatasets";
import { type RecordType } from "@/data/recordTemplates";

export type RequestStatus =
  | "draft"
  | "submitted"
  | "acknowledged"
  | "in-progress"
  | "fulfilled"
  | "partial"
  | "denied"
  | "appealed"
  | "overdue";

export interface PublicRecordsRequest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: RequestStatus;

  // Request details
  title: string;
  recordType: RecordType;
  agency: string;
  state: StateCode | "";
  description: string;
  generatedText: string;

  // Tracking information
  submittedDate?: Date;
  acknowledgedDate?: Date;
  dueDate?: Date;
  fulfilledDate?: Date;

  // Response tracking
  estimatedCost?: number;
  actualCost?: number;
  estimatedPages?: number;
  actualPages?: number;

  // Communications
  notes: RequestNote[];
  documents: RequestDocument[];

  // Appeal information
  denialReason?: string;
  appealDate?: Date;
  appealOutcome?: string;
}

export interface RequestNote {
  id: string;
  date: Date;
  type: "email" | "phone" | "letter" | "in-person" | "other";
  summary: string;
  fullText?: string;
}

export interface RequestDocument {
  id: string;
  date: Date;
  name: string;
  type: "request" | "acknowledgment" | "response" | "appeal" | "other";
  fileUrl?: string;
  notes?: string;
}

export interface RequestDeadline {
  requestId: string;
  type: "response-due" | "appeal-due" | "follow-up" | "custom";
  date: Date;
  description: string;
  completed: boolean;
}

// Cost estimation
export interface FeeEstimate {
  searchTime?: number; // hours
  searchRate?: number; // per hour
  copyFee?: number; // per page
  pages?: number;
  certificationFee?: number;
  mediaFee?: number; // for audio/video
  otherFees?: { description: string; amount: number }[];
  total: number;
  notes?: string;
}

// Appeal templates
export type AppealReason =
  | "improper-denial"
  | "excessive-fees"
  | "excessive-delay"
  | "inadequate-search"
  | "improper-redactions"
  | "other";

export interface AppealData {
  originalRequestDate: Date;
  denialDate: Date;
  denialReason: string;
  appealReason: AppealReason;
  explanation: string;
  legalBasis: string[];
}

// Statistics and analytics
export interface RequestStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
  byState: Partial<Record<StateCode, number>>;
  byRecordType: Partial<Record<RecordType, number>>;
  avgResponseTime: number; // days
  avgCost: number;
  fulfillmentRate: number; // percentage
  denialRate: number; // percentage
  overdueCount: number;
}
