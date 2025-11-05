import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Calendar, DollarSign, AlertCircle, Clock,
  TrendingUp, Archive, Trash2, Eye, Plus
} from "lucide-react";
import { type PublicRecordsRequest, type RequestStatus } from "@/types/requestTracking";
import {
  loadRequests, saveRequests, isRequestOverdue, getDaysUntilDue,
  calculateDueDate, formatDate, calculateRequestStats, deleteRequest
} from "@/utils/requestUtils";

export const RequestDashboard: React.FC<{ onCreateNew?: () => void }> = ({ onCreateNew }) => {
  const [requests, setRequests] = useState<PublicRecordsRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PublicRecordsRequest | null>(null);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  useEffect(() => {
    setRequests(loadRequests());
  }, []);

  const stats = calculateRequestStats(requests);

  const filteredRequests = filter === "all"
    ? requests
    : requests.filter(req => req.status === filter);

  const updateRequest = (id: string, updates: Partial<PublicRecordsRequest>) => {
    const updated = requests.map(req =>
      req.id === id ? { ...req, ...updates, updatedAt: new Date() } : req
    );
    setRequests(updated);
    saveRequests(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteRequest(id);
      setRequests(requests.filter(req => req.id !== id));
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    }
  };

  const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const variants: Record<RequestStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      submitted: { variant: "default", label: "Submitted" },
      acknowledged: { variant: "default", label: "Acknowledged" },
      "in-progress": { variant: "default", label: "In Progress" },
      fulfilled: { variant: "secondary", label: "Fulfilled" },
      partial: { variant: "secondary", label: "Partial" },
      denied: { variant: "destructive", label: "Denied" },
      appealed: { variant: "default", label: "Appealed" },
      overdue: { variant: "destructive", label: "Overdue" }
    };

    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfillment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fulfillmentRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.byStatus.fulfilled || 0} fulfilled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">need follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Label>Filter:</Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as RequestStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Request List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRequests.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter === "all" ? "No requests yet. Create your first request!" : `No ${filter} requests.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map(request => {
            const overdue = isRequestOverdue(request);
            const daysUntil = request.dueDate ? getDaysUntilDue(request.dueDate) : null;

            return (
              <Card key={request.id} className={overdue ? "border-destructive" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{request.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{request.agency}</p>
                    </div>
                    <StatusBadge status={overdue ? "overdue" : request.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{formatDate(request.submittedDate)}</span>
                    </div>

                    {request.dueDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due:</span>
                        <span className={overdue ? "text-destructive font-semibold" : ""}>
                          {formatDate(request.dueDate)}
                          {daysUntil !== null && (
                            <span className="ml-2">
                              ({daysUntil > 0 ? `${daysUntil} days` : `${Math.abs(daysUntil)} days overdue`})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {request.estimatedCost !== undefined && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Est. Cost:</span>
                        <span>${request.estimatedCost}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(request.id)}>
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Request Detail Modal (simplified - would use a proper modal component in production) */}
      {selectedRequest && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Request Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <p className="mt-1 font-medium">{selectedRequest.title}</p>
            </div>

            <div>
              <Label>Agency</Label>
              <p className="mt-1">{selectedRequest.agency}</p>
            </div>

            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <Select
                  value={selectedRequest.status}
                  onValueChange={(v) => updateRequest(selectedRequest.id, { status: v as RequestStatus })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="appealed">Appealed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedRequest.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Submitted Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={selectedRequest.submittedDate ? formatDate(selectedRequest.submittedDate) : ""}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const dueDate = selectedRequest.state ? calculateDueDate(selectedRequest.state, date) : undefined;
                    updateRequest(selectedRequest.id, { submittedDate: date, dueDate: dueDate || undefined });
                  }}
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={selectedRequest.dueDate ? format(selectedRequest.dueDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => updateRequest(selectedRequest.id, { dueDate: new Date(e.target.value) })}
                />
              </div>
            </div>

            {selectedRequest.notes && selectedRequest.notes.length > 0 && (
              <div>
                <Label>Notes ({selectedRequest.notes.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedRequest.notes.map(note => (
                    <div key={note.id} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">{note.type}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(note.date)}</span>
                      </div>
                      <p>{note.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper to format date for input
function format(date: Date, formatStr: string): string {
  if (formatStr === "yyyy-MM-dd") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return date.toISOString();
}
