// Enhanced public records request templates for specific record types

export type RecordType =
  | "body-camera"
  | "police-report"
  | "emails"
  | "contracts"
  | "meeting-minutes"
  | "financial-records"
  | "personnel-files"
  | "inspection-reports"
  | "surveillance-video"
  | "911-calls"
  | "use-of-force"
  | "complaints"
  | "policies"
  | "general";

export interface RequestTemplate {
  id: RecordType;
  name: string;
  description: string;
  keyFields: string[];
  template: (params: Record<string, string>) => string;
  tips: string[];
  feeEstimate: string;
}

export const RECORD_TEMPLATES: Record<RecordType, RequestTemplate> = {
  "body-camera": {
    id: "body-camera",
    name: "Body-Worn Camera Footage",
    description: "Request police body camera or dashboard camera footage",
    keyFields: ["date", "time", "location", "officerName", "caseNumber"],
    template: (p) => `
SUBJECT MATTER: Body-Worn Camera (BWC) and Dashboard Camera Footage

I request access to and copies of all body-worn camera footage and dashboard camera footage from the following incident:

INCIDENT DETAILS:
- Date: ${p.date || "[Date of incident]"}
- Time: ${p.time || "[Approximate time range]"}
- Location: ${p.location || "[Specific address or intersection]"}
- Officer(s): ${p.officerName || "[Officer names if known, or responding unit numbers]"}
- Case/CAD Number: ${p.caseNumber || "[If known]"}

REQUESTED RECORDS:
1. All BWC footage from all officers present at the scene
2. All dashboard camera footage from vehicles at the scene
3. Any related audio recordings
4. CAD (Computer-Aided Dispatch) records for this incident
5. Incident report narrative
6. Metadata showing when footage was accessed, by whom, and whether it was edited

FORMAT: Electronic format (MP4 or native format), with metadata intact. If redaction is necessary, please provide a redaction log specifying what was redacted and under what exemption.

PUBLIC INTEREST: This request serves the public interest in transparency and police accountability. [Add specific public interest justification if applicable]

EXPEDITED PROCESSING: This matter involves an urgent need to inform the public about actual or alleged government activity. [Explain urgency if applicable]
    `.trim(),
    tips: [
      "Be as specific as possible about date, time, and location",
      "Include officer names or badge numbers if known",
      "Request CAD records to cross-reference",
      "Ask for metadata to verify authenticity",
      "Specify you want unredacted footage unless legally required",
      "Request a redaction log if portions are withheld"
    ],
    feeEstimate: "$50-$200 depending on jurisdiction"
  },

  "police-report": {
    id: "police-report",
    name: "Police Reports & Incident Records",
    description: "Request police reports, arrest records, or incident documentation",
    keyFields: ["caseNumber", "date", "location", "involvedParties"],
    template: (p) => `
SUBJECT MATTER: Police Reports and Incident Records

I request access to and copies of all records related to the following incident:

INCIDENT IDENTIFICATION:
- Case/Report Number: ${p.caseNumber || "[Case number]"}
- Date of Incident: ${p.date || "[Date]"}
- Location: ${p.location || "[Location]"}
- Involved Parties: ${p.involvedParties || "[Names if known]"}

REQUESTED RECORDS:
1. Initial incident report and all supplemental reports
2. Arrest reports and booking records
3. Witness statements and interviews
4. Evidence logs and chain of custody documentation
5. Use of force reports (if applicable)
6. Officer narrative reports
7. Dispatch logs and CAD records
8. Any audio/video recordings related to the incident
9. Internal communications regarding this incident
10. Field interview cards or stop data

FORMAT: Electronic format (searchable PDF preferred), with all attachments and exhibits.

TIMEFRAME: All records from [Date] through [Date]
    `.trim(),
    tips: [
      "Include the case or report number if you have it",
      "Request all supplemental reports, not just the initial report",
      "Ask for evidence logs to know what else exists",
      "Request dispatch/CAD records for complete timeline",
      "Be specific about whether this involves an arrest, citation, or just a report"
    ],
    feeEstimate: "$25-$100 typically"
  },

  "emails": {
    id: "emails",
    name: "Email Communications",
    description: "Request email correspondence between officials",
    keyFields: ["dateRange", "senders", "recipients", "keywords", "subject"],
    template: (p) => `
SUBJECT MATTER: Email Communications

I request access to and copies of all email communications meeting the following criteria:

SEARCH PARAMETERS:
- Date Range: ${p.dateRange || "[From Date] to [To Date]"}
- Sender(s): ${p.senders || "[Names, titles, or departments]"}
- Recipient(s): ${p.recipients || "[Names, titles, or departments]"}
- Subject Matter: ${p.subject || "[Brief description of topic]"}
- Keywords: ${p.keywords || "[Specific search terms, phrases, or names]"}

REQUESTED RECORDS:
1. All email messages (sent and received) matching the above criteria
2. All attachments to those emails
3. Any draft emails related to this matter
4. Calendar invitations and meeting requests related to this topic
5. Email metadata (headers, routing information, timestamps)

FORMAT: Electronic format in native format (PST, MBOX, or EML) with metadata intact, or searchable PDFs with attachments.

SCOPE: Please search all relevant email accounts, including:
- Personal/work email accounts of the specified individuals
- Shared departmental or group email accounts
- Archived or backup email systems
- Personal devices used for government business (if applicable per policy)

SEGREGABILITY: If any emails contain exempt information, please produce the non-exempt portions with redaction logs explaining each withholding.
    `.trim(),
    tips: [
      "Use specific keywords and phrases, not general topics",
      "Name specific individuals, not just departments",
      "Request metadata to verify completeness",
      "Ask for draft emails and deleted items",
      "Specify date ranges that are reasonable but comprehensive",
      "Request native format to ensure no emails are hidden in attachments"
    ],
    feeEstimate: "$100-$500+ for large requests"
  },

  "contracts": {
    id: "contracts",
    name: "Contracts & Agreements",
    description: "Request government contracts, vendor agreements, or procurement records",
    keyFields: ["vendor", "contractAmount", "dateRange", "contractType"],
    template: (p) => `
SUBJECT MATTER: Government Contracts and Agreements

I request access to and copies of all records related to the following contract(s):

CONTRACT IDENTIFICATION:
- Vendor/Contractor: ${p.vendor || "[Name of company/individual]"}
- Contract Amount/Range: ${p.contractAmount || "[Dollar amount or range]"}
- Date Range: ${p.dateRange || "[Date range]"}
- Contract Type: ${p.contractType || "[Service type, e.g., construction, consulting, IT services]"}

REQUESTED RECORDS:
1. Original executed contract and all amendments
2. Request for Proposals (RFP) or Request for Qualifications (RFQ)
3. All bids or proposals received
4. Bid tabulation sheets and evaluation criteria
5. Justification for contractor selection
6. Payment records and invoices
7. Performance evaluations or progress reports
8. Correspondence between agency and contractor
9. Insurance certificates and bonds
10. Any conflict of interest disclosures
11. Subcontractor agreements
12. Change orders and modifications

FORMAT: Electronic format (searchable PDF) with all attachments and exhibits.

PUBLIC INTEREST: This request serves the public's interest in transparency in government spending and contractor accountability.
    `.trim(),
    tips: [
      "Include contract numbers if known",
      "Request the full procurement file, not just the signed contract",
      "Ask for all bids to understand the selection process",
      "Request payment records to verify amounts",
      "Ask for email correspondence about the contract",
      "Request conflict of interest forms"
    ],
    feeEstimate: "$50-$200 typically"
  },

  "meeting-minutes": {
    id: "meeting-minutes",
    name: "Meeting Minutes & Agendas",
    description: "Request records of public meetings, board meetings, or official gatherings",
    keyFields: ["meetingBody", "dateRange", "topic"],
    template: (p) => `
SUBJECT MATTER: Meeting Records - Minutes, Agendas, and Related Materials

I request access to and copies of all records related to meetings of:

MEETING IDENTIFICATION:
- Governing Body: ${p.meetingBody || "[City Council, Board of Supervisors, Commission, etc.]"}
- Date Range: ${p.dateRange || "[From Date] to [To Date]"}
- Topic/Subject: ${p.topic || "[Specific topic or agenda item if applicable]"}

REQUESTED RECORDS:
1. Meeting agendas (preliminary and final)
2. Meeting minutes (draft and approved)
3. Staff reports and recommendations
4. Public comments (written and transcribed)
5. Audio/video recordings of meetings
6. Presentation materials (slides, handouts)
7. Background materials distributed to members
8. Voting records and roll calls
9. Closed session agendas and documentation (if releasable)
10. Email correspondence between members regarding agenda items

FORMAT: Electronic format (audio/video in native format, documents as searchable PDFs).

TIMEFRAME: All meetings from ${p.dateRange || "[Start Date] through [End Date]"}

PUBLIC INTEREST: These records document public deliberations on matters of community concern.
    `.trim(),
    tips: [
      "Request both draft and final minutes",
      "Ask for audio/video even if minutes exist",
      "Request background materials given to board members",
      "Ask for closed session records that may now be releasable",
      "Request email discussions about agenda items"
    ],
    feeEstimate: "$25-$150 typically"
  },

  "financial-records": {
    id: "financial-records",
    name: "Financial Records & Budgets",
    description: "Request budget documents, expenditure records, or financial reports",
    keyFields: ["department", "fiscalYear", "accountCategory"],
    template: (p) => `
SUBJECT MATTER: Financial Records and Budget Documentation

I request access to and copies of all financial records for:

SCOPE:
- Department/Agency: ${p.department || "[Specific department or entire agency]"}
- Fiscal Year(s): ${p.fiscalYear || "[FY 2023-24, etc.]"}
- Account Category: ${p.accountCategory || "[Personnel, capital expenditures, specific line items]"}

REQUESTED RECORDS:
1. Adopted budget documents and all amendments
2. Detailed expenditure reports by line item
3. Revenue reports and projections
4. Payroll records (including overtime)
5. Purchase orders and requisitions
6. Credit card statements and receipts
7. Travel and expense reimbursements
8. Grant applications and award notices
9. Audit reports (internal and external)
10. Budget transfer requests and approvals
11. Cash flow statements
12. Debt service schedules

FORMAT: Electronic format, preferably in spreadsheet format (Excel, CSV) for financial data, and searchable PDF for narrative documents.

TIMEFRAME: Fiscal Year(s) ${p.fiscalYear || "[Specify]"}

PUBLIC INTEREST: This request serves the public's right to transparency in government spending and fiscal management.
    `.trim(),
    tips: [
      "Request data in Excel/CSV format for easier analysis",
      "Be specific about time periods and departments",
      "Ask for both budgeted and actual expenditures",
      "Request payroll data including overtime",
      "Ask for itemized credit card statements",
      "Request audit reports for context"
    ],
    feeEstimate: "$50-$250 depending on volume"
  },

  "personnel-files": {
    id: "personnel-files",
    name: "Personnel Files & Employment Records",
    description: "Request employee personnel files (note: often has privacy restrictions)",
    keyFields: ["employeeName", "position", "department", "dateRange"],
    template: (p) => `
SUBJECT MATTER: Personnel Records

I request access to and copies of releasable personnel records for:

EMPLOYEE IDENTIFICATION:
- Name: ${p.employeeName || "[Employee name]"}
- Position: ${p.position || "[Job title]"}
- Department: ${p.department || "[Department]"}
- Time Period: ${p.dateRange || "[Employment dates or specific period]"}

REQUESTED RECORDS (to the extent releasable under applicable law):
1. Employment application and resume
2. Job description and offer letter
3. Salary and compensation history
4. Performance evaluations
5. Disciplinary actions and investigations
6. Promotion and demotion records
7. Training certifications
8. Attendance and leave records
9. Commendations and awards
10. Grievances and complaints (filed by or against employee)
11. Separation/resignation records
12. Settlement agreements

NOTE ON PRIVACY: I understand that personnel records may be subject to privacy protections. Please release all records that are public under [cite relevant statute, e.g., California Government Code § 6254(c)]. For any withholdings, please provide a detailed exemption log.

PUBLIC INTEREST: This request serves the public interest in transparency regarding public employee conduct and use of taxpayer funds for salaries.

SEGREGABILITY: If portions of records are exempt, please redact only the exempt portions and release the remainder.
    `.trim(),
    tips: [
      "Many personnel records are protected by privacy laws",
      "Disciplinary records of police/public safety are often more accessible",
      "Request salary information separately - usually public",
      "Focus on official actions, not personal information",
      "Cite specific state laws that make certain records public",
      "Be prepared for heavy redactions or denials"
    ],
    feeEstimate: "$50-$200; often partially denied"
  },

  "inspection-reports": {
    id: "inspection-reports",
    name: "Inspection & Compliance Reports",
    description: "Request health, safety, or regulatory inspection records",
    keyFields: ["facility", "inspectionType", "dateRange"],
    template: (p) => `
SUBJECT MATTER: Inspection and Compliance Records

I request access to and copies of all inspection and compliance records for:

FACILITY/LOCATION:
- Name: ${p.facility || "[Business name or facility name]"}
- Address: ${p.location || "[Address]"}
- Inspection Type: ${p.inspectionType || "[Health, fire, building, environmental, etc.]"}
- Date Range: ${p.dateRange || "[Date range]"}

REQUESTED RECORDS:
1. All inspection reports and checklists
2. Violation notices and citations
3. Corrective action plans and follow-up reports
4. Photographic evidence from inspections
5. Correspondence regarding violations
6. Complaint records that triggered inspections
7. Compliance certifications and permits
8. Previous inspection history
9. Administrative hearings or appeals
10. Settlement agreements or consent orders

FORMAT: Electronic format (searchable PDFs with any photos or attachments).

SCOPE: All inspections conducted from ${p.dateRange || "[Start Date] through [End Date]"}

PUBLIC INTEREST: These records serve the public's interest in health and safety oversight and regulatory compliance.
    `.trim(),
    tips: [
      "Be specific about the type of inspection (health, fire, building, etc.)",
      "Include the facility's permit or license number if known",
      "Request the full inspection history, not just recent reports",
      "Ask for any complaints that led to inspections",
      "Request photos taken during inspections",
      "Ask for follow-up reports showing compliance"
    ],
    feeEstimate: "$25-$100 typically"
  },

  "surveillance-video": {
    id: "surveillance-video",
    name: "Surveillance & Security Footage",
    description: "Request video from public buildings or transportation",
    keyFields: ["location", "date", "time", "cameraLocation"],
    template: (p) => `
SUBJECT MATTER: Surveillance and Security Camera Footage

I request access to and copies of surveillance video footage from:

INCIDENT DETAILS:
- Location: ${p.location || "[Specific building/facility/transit station]"}
- Date: ${p.date || "[Date]"}
- Time: ${p.time || "[Time range, be as specific as possible]"}
- Camera Location: ${p.cameraLocation || "[Specific camera or area: entrance, platform, parking lot, etc.]"}

REQUESTED RECORDS:
1. All video footage from cameras with a view of the specified location
2. Video from adjacent cameras that may have captured relevant activity
3. Logs showing camera operational status
4. Camera placement maps or diagrams
5. Any incident reports related to this footage
6. Metadata showing chain of custody

TECHNICAL SPECIFICATIONS:
- Format: Native video format (MP4, AVI, or proprietary format with player)
- Resolution: Highest available
- Timeframe: ${p.time || "[Start time] through [End time]"} (provide extra buffer if reasonable)

NOTE: I understand video may be reviewed to blur faces or other identifying information of third parties not relevant to the request, but please do not blur individuals who are the subject of this request.

URGENCY: Video surveillance systems often overwrite footage after [7-30] days. Please preserve all responsive footage immediately upon receipt of this request.
    `.trim(),
    tips: [
      "Make request ASAP - footage is often overwritten quickly",
      "Be very specific about date, time, and camera location",
      "Request a camera map to identify other relevant cameras",
      "Ask for chain of custody documentation",
      "Specify you want native format, not screenshots",
      "Request metadata to verify authenticity",
      "Note any specific individuals or events to help them locate footage"
    ],
    feeEstimate: "$50-$300 depending on length"
  },

  "911-calls": {
    id: "911-calls",
    name: "911 Call Recordings & Dispatch Logs",
    description: "Request emergency call recordings and dispatch records",
    keyFields: ["date", "time", "location", "callType"],
    template: (p) => `
SUBJECT MATTER: 911 Call Recordings and Dispatch Records

I request access to and copies of all records related to the following 911 call/incident:

INCIDENT IDENTIFICATION:
- Date: ${p.date || "[Date]"}
- Time: ${p.time || "[Approximate time]"}
- Location: ${p.location || "[Address or location]"}
- Call Type: ${p.callType || "[Nature of call if known]"}
- CAD Number: ${p.cadNumber || "[If known]"}

REQUESTED RECORDS:
1. Audio recording of 911 call(s)
2. CAD (Computer-Aided Dispatch) records
3. Dispatch audio recordings (radio traffic)
4. Call-taker notes and incident details
5. Response times and unit assignments
6. Officer/responder arrival and departure times
7. Any updates or supplemental dispatches
8. Incident disposition codes

FORMAT: Audio in native format (MP3, WAV, or original format), documents as searchable PDF.

NOTE ON REDACTION: I understand that certain personal information may be redacted under applicable privacy laws. Please provide a redaction log for any audio portions that are muted or documents that are withheld.

PUBLIC INTEREST: This request serves the public interest in emergency response times, dispatcher training, and accountability.
    `.trim(),
    tips: [
      "Be as specific as possible about date/time/location",
      "Request both the initial call and all dispatch traffic",
      "Ask for CAD records to see full timeline",
      "Request response time data",
      "Be aware that caller information may be redacted",
      "Multiple calls may have been made - request all related calls",
      "Some jurisdictions charge per minute of audio"
    ],
    feeEstimate: "$25-$150 depending on audio length"
  },

  "use-of-force": {
    id: "use-of-force",
    name: "Use of Force Reports & Policies",
    description: "Request police use of force incidents and related policies",
    keyFields: ["date", "location", "officerName", "incidentType"],
    template: (p) => `
SUBJECT MATTER: Use of Force Records

I request access to and copies of all records related to use of force incidents as follows:

INCIDENT DETAILS (if requesting specific incident):
- Date: ${p.date || "[Date or date range]"}
- Location: ${p.location || "[Location]"}
- Officer(s): ${p.officerName || "[Names if known]"}
- Type of Force: ${p.incidentType || "[Firearm, Taser, physical restraint, etc.]"}

REQUESTED RECORDS:
1. Use of force reports (officer narratives)
2. Supervisor review and investigation reports
3. Medical reports for any injuries
4. Photographs of injuries or scene
5. Witness statements
6. Body-worn camera or other video evidence
7. Audio recordings of incident
8. Internal affairs investigation records (if applicable)
9. Review board findings and recommendations
10. Disciplinary actions taken (if any)
11. Training records for officers involved
12. Use of force policies and procedures in effect at the time

ADDITIONAL REQUEST (if seeking aggregate data):
- Summary data on all use of force incidents for [Time Period]
- Broken down by: type of force, officer, precinct, demographics, injuries, outcomes

FORMAT: Electronic format (video in native format, documents as searchable PDF).

PUBLIC INTEREST: This request serves the vital public interest in police accountability and transparency in use of force.

EXPEDITED PROCESSING: The public has an urgent need to be informed about this incident involving government authority and potential civil rights implications.
    `.trim(),
    tips: [
      "Can request specific incidents or aggregate data",
      "Request body camera footage in same request",
      "Ask for supervisor review reports",
      "Request the use of force policy that was in effect",
      "Ask for officer training records on use of force",
      "Request internal affairs investigations if applicable",
      "Consider requesting data on patterns over time"
    ],
    feeEstimate: "$50-$300 depending on scope"
  },

  "complaints": {
    id: "complaints",
    name: "Complaints & Grievances",
    description: "Request citizen complaints or internal grievances",
    keyFields: ["subject", "dateRange", "department", "complaintType"],
    template: (p) => `
SUBJECT MATTER: Complaint and Grievance Records

I request access to and copies of all complaint records as follows:

COMPLAINT IDENTIFICATION:
- Subject: ${p.subject || "[Subject of complaints - specific person, department, or issue]"}
- Date Range: ${p.dateRange || "[Date range]"}
- Department: ${p.department || "[Specific department or agency]"}
- Type: ${p.complaintType || "[Citizen complaints, internal grievances, discrimination claims, etc.]"}

REQUESTED RECORDS:
1. Original complaint documents (forms, letters, emails)
2. Investigation reports and findings
3. Interview notes and witness statements
4. Evidence collected during investigation
5. Investigator conclusions and recommendations
6. Disciplinary actions taken (if any)
7. Response letters to complainants
8. Appeal documents (if applicable)
9. Settlement agreements
10. Policies and procedures for handling complaints
11. Statistical data on complaints received and outcomes

SCOPE:
- All complaints meeting the above criteria from ${p.dateRange || "[Start Date]"} through ${p.dateRange || "[End Date]"}
- Both sustained and non-sustained complaints
- Closed and pending investigations (to extent releasable)

FORMAT: Electronic format (searchable PDF).

NOTE ON PRIVACY: While I understand some complainant information may be withheld, please release records showing: nature of complaint, investigation findings, and any disciplinary action. These are matters of public interest.

PUBLIC INTEREST: This request serves the public interest in accountability and transparency in handling of complaints against public officials/employees.
    `.trim(),
    tips: [
      "Specify whether you want complaints against a specific person or about a topic",
      "Request investigation outcomes, not just initial complaints",
      "Ask for statistical summaries as well as individual cases",
      "Request the complaint handling policy",
      "Ask for both sustained and unsustained complaints",
      "May face privacy objections - cite public interest",
      "Police complaints often have more disclosure than other employees"
    ],
    feeEstimate: "$50-$200"
  },

  "policies": {
    id: "policies",
    name: "Policies, Procedures & Training Materials",
    description: "Request agency policies, standard operating procedures, or training materials",
    keyFields: ["policyTopic", "department", "dateRange"],
    template: (p) => `
SUBJECT MATTER: Policies, Procedures, and Training Materials

I request access to and copies of all policies, procedures, and training materials related to:

SCOPE:
- Topic/Subject: ${p.policyTopic || "[Specific topic, e.g., use of force, evidence handling, records retention]"}
- Department: ${p.department || "[Specific department or agency-wide]"}
- Time Period: ${p.dateRange || "[Current policies and/or historical policies]"}

REQUESTED RECORDS:
1. Current policies and standard operating procedures (SOPs)
2. Historical/superseded policies showing changes over time
3. Policy revision history and justifications for changes
4. Training materials and curricula related to these policies
5. Training records showing who received training and when
6. Policy compliance audits or reviews
7. Memos or directives implementing or interpreting policies
8. Legal guidance or opinions regarding policies
9. Public comments received on draft policies (if applicable)
10. Accreditation standards or best practices documents referenced

FORMAT: Electronic format (searchable PDF or Word documents).

TIMEFRAME:
- Current policies as of [Date]
- All revisions from ${p.dateRange || "[Start Date] through present"}

PUBLIC INTEREST: Public access to government policies ensures transparency in how agencies operate and how laws are enforced.

NOTE: Policies and procedures are generally not exempt from disclosure unless they would compromise security or ongoing investigations. Please provide detailed justification for any withholdings.
    `.trim(),
    tips: [
      "Request both current and historical versions to track changes",
      "Ask for training materials to see how policy is taught",
      "Request compliance audits to see if policy is followed",
      "Ask for legal opinions interpreting the policy",
      "Request related memos and directives",
      "Can request all policies or specific topics",
      "Generally these should have minimal exemptions"
    ],
    feeEstimate: "$25-$100"
  },

  "general": {
    id: "general",
    name: "General Public Records Request",
    description: "Template for any other type of public record",
    keyFields: ["description", "dateRange", "keywords"],
    template: (p) => `
SUBJECT MATTER: ${p.description || "[Describe the records you are seeking]"}

I request access to and copies of the following records:

DESCRIPTION OF RECORDS:
${p.description || "[Provide a detailed description of the records you seek, including:]"}
- Subject matter or topic
- Names of people or organizations involved
- Specific types of documents (reports, emails, contracts, etc.)
- Date range
- Department or office that would have the records

REQUESTED RECORDS:
${p.specificItems || "[List specific categories of records you want:]"}
1. [Category 1]
2. [Category 2]
3. [Category 3]
[etc.]

TIMEFRAME: ${p.dateRange || "[Specify date range, e.g., January 1, 2023 through December 31, 2023]"}

KEYWORDS: ${p.keywords || "[Provide keywords or search terms that might help locate records]"}

FORMAT: Electronic format (searchable PDF for documents, native format for audio/video), with all attachments and metadata intact.

PUBLIC INTEREST: [Explain why these records are of public interest]

SEGREGABILITY: If any portions of responsive records are exempt from disclosure, please redact only those specific portions and release the remainder. Please provide a detailed exemption log explaining each withholding.
    `.trim(),
    tips: [
      "Be as specific as possible about what you're seeking",
      "Use the 'who, what, when, where, why' approach",
      "Provide keywords to help the search",
      "Name specific people or departments",
      "Give reasonable date ranges",
      "Explain the public interest",
      "Request electronic format",
      "Ask for segregability of exempt portions"
    ],
    feeEstimate: "Varies greatly"
  }
};

export function getRecordTemplate(type: RecordType): RequestTemplate {
  return RECORD_TEMPLATES[type];
}

export function getAllRecordTypes(): RequestTemplate[] {
  return Object.values(RECORD_TEMPLATES);
}
