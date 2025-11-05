// Enhanced Public Records Toolkit with comprehensive features
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Copy, Download, FileText, Save, Calculator, Clock, AlertTriangle,
  TrendingUp, HelpCircle
} from "lucide-react";
import { ALL_STATES, PUBLIC_RECORDS, type StateCode } from "@/data/legalDatasets";
import { RECORD_TEMPLATES, getAllRecordTypes, type RecordType } from "@/data/recordTemplates";
import { type PublicRecordsRequest } from "@/types/requestTracking";
import {
  estimateFees, calculateDueDate, formatDate,
  generateId, saveRequests, loadRequests
} from "@/utils/requestUtils";
import { RequestDashboard } from "@/components/RequestDashboard";

function copyToClipboard(text: string) { return navigator.clipboard.writeText(text); }
function downloadText(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const PublicRecordsToolkit: React.FC = () => {
  const [currentView, setCurrentView] = useState<"builder" | "dashboard">("builder");

  // Form state
  const [recordType, setRecordType] = useState<RecordType>("general");
  const [state, setState] = useState<StateCode | "">("");
  const [agency, setAgency] = useState("");
  const [title, setTitle] = useState("");

  // Template-specific fields
  const [templateFields, setTemplateFields] = useState<Record<string, string>>({});

  // Generated content
  const [generatedRequest, setGeneratedRequest] = useState("");

  // Cost estimation
  const [estimatedPages, setEstimatedPages] = useState<number>(0);
  const [estimatedAudio, setEstimatedAudio] = useState<number>(0);
  const [estimatedSearch, setEstimatedSearch] = useState<number>(0);

  // Current request being edited
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const currentTemplate = RECORD_TEMPLATES[recordType];
  const stateInfo = state ? PUBLIC_RECORDS[state] : undefined;

  // Calculate estimated cost
  const costEstimate = useMemo(() => {
    return estimateFees({
      state,
      recordType,
      estimatedPages,
      estimatedAudioMinutes: estimatedAudio,
      estimatedSearchHours: estimatedSearch
    });
  }, [state, recordType, estimatedPages, estimatedAudio, estimatedSearch]);

  // Calculate due date
  const estimatedDueDate = useMemo(() => {
    if (!state) return null;
    return calculateDueDate(state, new Date());
  }, [state]);

  const handleGenerate = () => {
    const template = currentTemplate.template(templateFields);

    // Build full request
    const fullRequest = `[Your Name]
[Your Address]
[City, State, ZIP Code]
[Email Address]
[Phone Number]

${formatDate(new Date())}

${agency || "[Agency Name]"}
${stateInfo?.name || "[State]"} Public Records Officer
[Agency Address]
[City, State, ZIP Code]

Re: Public Records Request — ${currentTemplate.name}
${stateInfo ? `Statute: ${stateInfo.statute}` : ""}

Dear Records Officer:

Pursuant to ${stateInfo?.statute || "the applicable public records law"}, I request access to and copies of the following records:

${template}

FORMAT: Electronic format preferred (searchable PDFs for documents, native format for audio/video), with all attachments and metadata intact.

FEE WAIVER REQUEST: I request a fee waiver as this request serves the public interest in government transparency and accountability. If fees will exceed $${costEstimate.total > 0 ? costEstimate.total : 50}, please contact me before proceeding.

DEADLINE: Under ${stateInfo?.statute || "applicable law"}, a response is due within ${stateInfo?.displayTime || "a reasonable time"}. Please acknowledge receipt within 5 business days and provide an estimated date of completion.

PRESERVATION: Please preserve all responsive records and do not delete, destroy, or alter any potentially responsive documents.

CONTACT: Please contact me if you need clarification or have questions about this request.

Sincerely,
[Your Name]`;

    setGeneratedRequest(fullRequest);
  };

  const handleSaveRequest = () => {
    const requests = loadRequests();

    const newRequest: PublicRecordsRequest = {
      id: currentRequestId || generateId(),
      createdAt: currentRequestId ? requests.find(r => r.id === currentRequestId)?.createdAt || new Date() : new Date(),
      updatedAt: new Date(),
      status: "draft",
      title: title || `${currentTemplate.name} - ${agency}`,
      recordType,
      agency,
      state,
      description: templateFields.description || currentTemplate.description,
      generatedText: generatedRequest,
      estimatedCost: costEstimate.total,
      estimatedPages,
      notes: [],
      documents: []
    };

    const updated = currentRequestId
      ? requests.map(r => r.id === currentRequestId ? newRequest : r)
      : [...requests, newRequest];

    saveRequests(updated);
    alert("Request saved successfully!");
    setCurrentRequestId(newRequest.id);
  };

  const handleTemplateFieldChange = (key: string, value: string) => {
    setTemplateFields(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Public Records Toolkit Pro</h1>
          <p className="text-muted-foreground">
            Comprehensive FOIA & public records request system with tracking, appeals, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentView === "builder" ? "default" : "outline"}
            onClick={() => setCurrentView("builder")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Request Builder
          </Button>
          <Button
            variant={currentView === "dashboard" ? "default" : "outline"}
            onClick={() => setCurrentView("dashboard")}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>

      {currentView === "dashboard" ? (
        <RequestDashboard onCreateNew={() => setCurrentView("builder")} />
      ) : (
        <>
          {/* Quick Info Bar */}
          {stateInfo && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Statute:</span>
                    <span>{stateInfo.statute}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Response Time:</span>
                    <span>{stateInfo.displayTime}</span>
                  </div>
                  {estimatedDueDate && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Est. Due Date:</span>
                      <span>{formatDate(estimatedDueDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Form */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Record Type</Label>
                      <Select value={recordType} onValueChange={(v) => setRecordType(v as RecordType)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {getAllRecordTypes().map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentTemplate.description}
                      </p>
                    </div>

                    <div>
                      <Label>State / Jurisdiction</Label>
                      <Select value={state as string} onValueChange={(v) => setState(v as StateCode | "")}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="">Federal / Other</SelectItem>
                          {ALL_STATES.map(s => (
                            <SelectItem key={s} value={s}>
                              {s} - {PUBLIC_RECORDS[s]?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Request Title (for your tracking)</Label>
                    <Input
                      className="mt-1"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Body cam footage from Main St incident"
                    />
                  </div>

                  <div>
                    <Label>Agency Name</Label>
                    <Input
                      className="mt-1"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="e.g., City of Springfield Police Department"
                    />
                  </div>

                  {/* Template-specific fields */}
                  {currentTemplate.keyFields.map(field => (
                    <div key={field}>
                      <Label className="capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                      {field.includes("description") || field.includes("explanation") ? (
                        <Textarea
                          className="mt-1"
                          rows={4}
                          value={templateFields[field] || ""}
                          onChange={(e) => handleTemplateFieldChange(field, e.target.value)}
                          placeholder={`Enter ${field}...`}
                        />
                      ) : (
                        <Input
                          className="mt-1"
                          value={templateFields[field] || ""}
                          onChange={(e) => handleTemplateFieldChange(field, e.target.value)}
                          placeholder={`Enter ${field}...`}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Tips for {currentTemplate.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {currentTemplate.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Estimated Fee Range:</p>
                    <p className="text-sm text-muted-foreground">{currentTemplate.feeEstimate}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Cost Calculator */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Cost Estimate</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Estimated Pages</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={estimatedPages}
                      onChange={(e) => setEstimatedPages(Number(e.target.value))}
                      min="0"
                    />
                  </div>

                  {(recordType === "body-camera" || recordType === "surveillance-video" || recordType === "911-calls") && (
                    <div>
                      <Label className="text-xs">Estimated Audio/Video (minutes)</Label>
                      <Input
                        type="number"
                        className="mt-1"
                        value={estimatedAudio}
                        onChange={(e) => setEstimatedAudio(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Estimated Search Time (hours)</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={estimatedSearch}
                      onChange={(e) => setEstimatedSearch(Number(e.target.value))}
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Search Cost:</span>
                      <span className="font-medium">${((costEstimate.searchTime || 0) * (costEstimate.searchRate || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Copy Cost:</span>
                      <span className="font-medium">${((costEstimate.pages || 0) * (costEstimate.copyFee || 0)).toFixed(2)}</span>
                    </div>
                    {costEstimate.mediaFee && costEstimate.mediaFee > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Media Cost:</span>
                        <span className="font-medium">${costEstimate.mediaFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>${costEstimate.total.toFixed(2)}</span>
                    </div>
                    {costEstimate.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{costEstimate.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={handleGenerate}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Request
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleSaveRequest} disabled={!generatedRequest}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Request
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      copyToClipboard(generatedRequest);
                      alert("Copied to clipboard!");
                    }}
                    disabled={!generatedRequest}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => downloadText(`${title || "request"}.txt`, generatedRequest)}
                    disabled={!generatedRequest}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download .txt
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Generated Preview */}
          {generatedRequest && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Request</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[400px] font-mono text-sm"
                  value={generatedRequest}
                  onChange={(e) => setGeneratedRequest(e.target.value)}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
