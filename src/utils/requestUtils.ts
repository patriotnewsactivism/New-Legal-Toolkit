// Utility functions for public records request management

import { addBusinessDays, addDays, differenceInBusinessDays, differenceInDays, format } from "date-fns";
import { type StateCode, PUBLIC_RECORDS } from "@/data/legalDatasets";
import { type PublicRecordsRequest, type FeeEstimate, type AppealData, type AppealReason } from "@/types/requestTracking";
import { type RecordType } from "@/data/recordTemplates";

// Calculate the due date for a request based on state law
export function calculateDueDate(state: StateCode | "", submittedDate: Date): Date | null {
  if (!state) return null;

  const stateInfo = PUBLIC_RECORDS[state];
  if (!stateInfo) return null;

  const { responseWindow } = stateInfo;

  if (responseWindow.type === "none" || !responseWindow.value) {
    // Default to 10 business days if no specific timeframe
    return addBusinessDays(submittedDate, 10);
  }

  if (responseWindow.type === "business_days") {
    return addBusinessDays(submittedDate, responseWindow.value);
  }

  if (responseWindow.type === "calendar_days") {
    return addDays(submittedDate, responseWindow.value);
  }

  return null;
}

// Check if a request is overdue
export function isRequestOverdue(request: PublicRecordsRequest): boolean {
  if (request.status === "fulfilled" || request.status === "denied") {
    return false;
  }

  if (!request.dueDate) return false;

  return new Date() > request.dueDate;
}

// Calculate days until deadline or days overdue
export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  return differenceInDays(dueDate, today);
}

// Calculate business days until deadline
export function getBusinessDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  return differenceInBusinessDays(dueDate, today);
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate estimated fees
export function estimateFees(params: {
  state: StateCode | "";
  recordType: RecordType;
  estimatedPages?: number;
  estimatedAudioMinutes?: number;
  estimatedSearchHours?: number;
}): FeeEstimate {
  const { state, recordType, estimatedPages = 0, estimatedAudioMinutes = 0, estimatedSearchHours = 0 } = params;

  let mediaFee = 0;
  const otherFees: { description: string; amount: number }[] = [];

  // State-specific fee schedules (simplified - real rates vary)
  const stateFees: Partial<Record<StateCode, { search: number; copy: number; certification: number }>> = {
    CA: { search: 0, copy: 0.10, certification: 15 },
    NY: { search: 25, copy: 0.25, certification: 15 },
    TX: { search: 0, copy: 0.10, certification: 5 },
    FL: { search: 0, copy: 0.15, certification: 1 },
    IL: { search: 0, copy: 0.10, certification: 10 },
  };

  const fees = state && stateFees[state] ? stateFees[state] : { search: 20, copy: 0.15, certification: 10 };

  // Calculate search costs
  const searchCost = estimatedSearchHours * (fees?.search || 20);

  // Calculate copy costs
  const copyCost = estimatedPages * (fees?.copy || 0.15);

  // Calculate media costs (audio/video)
  if (estimatedAudioMinutes > 0) {
    // Many jurisdictions charge per minute for audio/video
    mediaFee = estimatedAudioMinutes * 0.50;
  }

  // Record type specific estimates
  if (recordType === "body-camera" || recordType === "surveillance-video") {
    otherFees.push({ description: "Video production fee", amount: 25 });
  }

  if (recordType === "emails" && estimatedPages > 100) {
    otherFees.push({ description: "Electronic search surcharge", amount: 50 });
  }

  const total = searchCost + copyCost + mediaFee + otherFees.reduce((sum, fee) => sum + fee.amount, 0);

  return {
    searchTime: estimatedSearchHours,
    searchRate: fees?.search || 20,
    copyFee: fees?.copy || 0.15,
    pages: estimatedPages,
    mediaFee,
    otherFees,
    total: Math.round(total * 100) / 100,
    notes: total > 100 ? "Request a fee waiver if this serves public interest" : undefined
  };
}

// Format date for display
export function formatDate(date: Date | undefined): string {
  if (!date) return "—";
  return format(date, "MMM d, yyyy");
}

// Format date with time
export function formatDateTime(date: Date | undefined): string {
  if (!date) return "—";
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

// Calculate business days between two dates
export function calculateBusinessDays(start: Date, end: Date): number {
  return differenceInBusinessDays(end, start);
}

// Generate an appeal letter
export function generateAppeal(data: AppealData): string {
  const reasonText: Record<AppealReason, string> = {
    "improper-denial": "The denial of my request was improper and not justified under the applicable exemptions",
    "excessive-fees": "The fees assessed are excessive and not authorized by law",
    "excessive-delay": "The agency has failed to respond within the statutory timeframe",
    "inadequate-search": "The agency's search for responsive records was inadequate",
    "improper-redactions": "The redactions applied to responsive records are overbroad and not justified",
    "other": "The agency's response to my request was inadequate for the following reasons"
  };

  const legalCitations = data.legalBasis.length > 0
    ? `\n\nLEGAL BASIS:\n${data.legalBasis.map(basis => `• ${basis}`).join("\n")}`
    : "";

  return `[Your Name]
[Your Address]
[City, State, ZIP Code]
[Email Address]
[Phone Number]

${formatDate(new Date())}

[Agency Name]
[Agency Address]
[City, State, ZIP Code]

Re: ADMINISTRATIVE APPEAL — Public Records Request
Original Request Date: ${formatDate(data.originalRequestDate)}
Denial Date: ${formatDate(data.denialDate)}

Dear Records Officer / Appeals Officer:

I am writing to appeal the ${data.denialDate ? "denial" : "inadequate response"} to my public records request dated ${formatDate(data.originalRequestDate)}.

BACKGROUND:
On ${formatDate(data.originalRequestDate)}, I submitted a public records request seeking [brief description]. On ${formatDate(data.denialDate)}, the agency ${data.denialReason ? `denied my request, stating: "${data.denialReason}"` : "failed to adequately respond to my request"}.

BASIS FOR APPEAL:
${reasonText[data.appealReason]}. ${data.explanation}
${legalCitations}

REQUESTED RELIEF:
I respectfully request that you:
1. Reverse the denial and produce all responsive records;
2. Conduct a thorough search for all responsive records;
3. Release all non-exempt portions of records with a detailed exemption log;
4. ${data.appealReason === "excessive-fees" ? "Waive or substantially reduce the fees" : "Respond within the timeframe required by law"}.

PUBLIC INTEREST:
This request serves a significant public interest in [explain public interest - transparency, accountability, public safety, etc.]. ${data.appealReason === "excessive-fees" ? "Accordingly, I request that fees be waived pursuant to the public interest fee waiver provision of the applicable statute." : ""}

SEGREGABILITY:
If any portions of responsive records are exempt, I request that all segregable, non-exempt portions be released immediately.

I request a written determination on this appeal within the time required by law. Please contact me if you require any additional information.

Sincerely,
[Your Name]

cc: [Agency Head, General Counsel, or State FOI Officer if applicable]`;
}

// Generate a follow-up letter for overdue requests
export function generateFollowUp(request: PublicRecordsRequest): string {
  const daysSince = request.submittedDate
    ? differenceInDays(new Date(), request.submittedDate)
    : 0;

  const statutoryDeadline = request.state && PUBLIC_RECORDS[request.state]
    ? PUBLIC_RECORDS[request.state]?.displayTime
    : "the statutory timeframe";

  return `[Your Name]
[Your Address]
[City, State, ZIP Code]
[Email Address]
[Phone Number]

${formatDate(new Date())}

${request.agency}
[Agency Address]
[City, State, ZIP Code]

Re: FOLLOW-UP — Overdue Public Records Request
Original Request Date: ${formatDate(request.submittedDate)}
Request ID/Reference: [If provided by agency]

Dear Records Officer:

I am writing to follow up on my public records request submitted ${daysSince} days ago on ${formatDate(request.submittedDate)}.

ORIGINAL REQUEST:
${request.description}

STATUS:
To date, I have not received ${request.acknowledgedDate ? "a substantive response to" : "any response to"} my request. Under applicable law, the agency is required to respond within ${statutoryDeadline}. This deadline has now passed.

PRESERVATION NOTICE:
This letter serves as a preservation notice. All responsive records must be preserved and must not be destroyed, altered, or transferred. This includes emails, electronic documents, and any backup systems.

REQUESTED ACTION:
I request that you:
1. Immediately acknowledge this request if you have not already done so;
2. Provide a date by which responsive records will be produced;
3. If responsive records have already been compiled, produce them immediately;
4. Provide a detailed explanation for any delay;
5. Confirm that all responsive records are being preserved.

Please respond within 5 business days. Continued delay may require me to seek legal remedies, including mandamus action or filing a complaint with [relevant oversight body].

I appreciate your prompt attention to this matter.

Sincerely,
[Your Name]

${request.state ? `cc: [State FOI Officer or relevant oversight body]` : ""}`;
}

// Calculate statistics for multiple requests
export function calculateRequestStats(requests: PublicRecordsRequest[]) {
  const stats = {
    total: requests.length,
    byStatus: {} as Record<string, number>,
    avgResponseTime: 0,
    avgCost: 0,
    fulfillmentRate: 0,
    denialRate: 0,
    overdueCount: 0
  };

  if (requests.length === 0) return stats;

  let totalResponseDays = 0;
  let totalCost = 0;
  let requestsWithCost = 0;
  let requestsWithResponseTime = 0;

  requests.forEach(req => {
    // Count by status
    stats.byStatus[req.status] = (stats.byStatus[req.status] || 0) + 1;

    // Calculate response time
    if (req.submittedDate && req.fulfilledDate) {
      totalResponseDays += differenceInDays(req.fulfilledDate, req.submittedDate);
      requestsWithResponseTime++;
    }

    // Calculate costs
    if (req.actualCost) {
      totalCost += req.actualCost;
      requestsWithCost++;
    }

    // Count overdue
    if (isRequestOverdue(req)) {
      stats.overdueCount++;
    }
  });

  stats.avgResponseTime = requestsWithResponseTime > 0
    ? Math.round(totalResponseDays / requestsWithResponseTime)
    : 0;

  stats.avgCost = requestsWithCost > 0
    ? Math.round((totalCost / requestsWithCost) * 100) / 100
    : 0;

  const completed = (stats.byStatus["fulfilled"] || 0) + (stats.byStatus["partial"] || 0);
  stats.fulfillmentRate = Math.round((completed / requests.length) * 100);

  const denied = stats.byStatus["denied"] || 0;
  stats.denialRate = Math.round((denied / requests.length) * 100);

  return stats;
}

// Storage helpers using localStorage
const STORAGE_KEY = "public-records-requests";

export function saveRequests(requests: PublicRecordsRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Failed to save requests:", error);
  }
}

export function loadRequests(): PublicRecordsRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((req: any) => ({
      ...req,
      createdAt: new Date(req.createdAt),
      updatedAt: new Date(req.updatedAt),
      submittedDate: req.submittedDate ? new Date(req.submittedDate) : undefined,
      acknowledgedDate: req.acknowledgedDate ? new Date(req.acknowledgedDate) : undefined,
      dueDate: req.dueDate ? new Date(req.dueDate) : undefined,
      fulfilledDate: req.fulfilledDate ? new Date(req.fulfilledDate) : undefined,
      appealDate: req.appealDate ? new Date(req.appealDate) : undefined,
      notes: req.notes.map((note: any) => ({
        ...note,
        date: new Date(note.date)
      })),
      documents: req.documents.map((doc: any) => ({
        ...doc,
        date: new Date(doc.date)
      }))
    }));
  } catch (error) {
    console.error("Failed to load requests:", error);
    return [];
  }
}

export function deleteRequest(id: string): void {
  const requests = loadRequests();
  const filtered = requests.filter(req => req.id !== id);
  saveRequests(filtered);
}
