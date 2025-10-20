"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useTickets } from "@/hooks/use-tickets"
import { ticketsApi } from "@/lib/api/tickets"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal-new"
import { AssignTicketModal } from "@/components/modals/assign-ticket-modal"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { 
  Eye, 
  Plus, 
  FileText,
  AlertTriangle,
  Clock,
  Loader2,
  User,
  Edit,
  Check
} from "lucide-react"
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { requestsApi } from "@/lib/api/requests"
import { Request, RequestStatus } from "@/lib/types/requests"
import { format } from "date-fns"
import { StatusBadge } from "@/components/requests/status-badge"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import Link from "next/link"


function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (!document.hidden) {
        setLastActivity(Date.now());
      }
    };

    const handleFocus = () => {
      setIsVisible(true);
      setLastActivity(Date.now());
    };

    const handleBlur = () => {
      setIsVisible(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return { isVisible, lastActivity };
}

export default function AllTicketsClientPage() {
  const queryClient = useQueryClient();
  const { isVisible, lastActivity } = useTabVisibility();
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [selectedTicketForStatusChange, setSelectedTicketForStatusChange] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newPriority, setNewPriority] = useState<string>("");
  const [lastRefresh, setLastRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createTicketModalOpen, setCreateTicketModalOpen] = useState(false);
  const [assignTicketModalOpen, setAssignTicketModalOpen] = useState(false);
  const [selectedTicketForAssignment, setSelectedTicketForAssignment] = useState<any | null>(null);
  
  // Reply/Comment state
  const [replyText, setReplyText] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  // Translation hooks
  const t = useTranslations('tickets');
  const tCommon = useTranslations('common');


  
  
  
  
  // Fetch tickets with role-based logic
  const { tickets, isLoading, refetch, isFetching, userRole } = useTickets()

  // Update ticket status and priority mutation with OPTIMISTIC UPDATES
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, priority }: { id: string; status?: string; priority?: string }) => {
      console.debug("[Tickets] Updating ticket:", { id, status, priority });
      const updateData: any = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      
      // Add closed_at date when status is closed
      if (status === 'closed') {
        updateData.closed_at = new Date().toISOString();
      }
      
      return ticketsApi.updateTicket(id, updateData);
    },
    onMutate: async ({ id, status, priority }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tickets", userRole] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["tickets", userRole]);

      // Optimistically update to the new value
      queryClient.setQueryData(["tickets", userRole], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((ticket: any) =>
            ticket.id === id ? { ...ticket, ...(status && { status }), ...(priority && { priority }) } : ticket
          )
        };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err: any, variables, context) => {
      console.error("[Tickets] Update ticket error:", err);
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(["tickets", userRole], context.previousData);
      }
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update ticket.", variant: "destructive" });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["tickets", userRole] });
    },
    onSuccess: () => {
      toast({ title: "Success", description: `Ticket updated successfully.`, variant: "default" });
      setChangeStatusModalOpen(false);
      setSelectedTicketForStatusChange(null);
      setNewStatus("");
      setNewPriority("");
    },
  });

  // Create ticket mutation for users
  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string; description: string; priority: "low" | "medium" | "high" | "urgent"; tags: string[] }) => {
      console.debug("[Admin Tickets] Creating ticket with data:", data);
      const res = await ticketsApi.createTicket({
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        tags: data.tags
      });
      console.debug("[Admin Tickets] Create ticket response:", res.data);
      return res.data.data;
    },
    onSuccess: (newTicket) => {
      queryClient.setQueryData(["tickets", userRole], (old: any) => {
        if (!old) return { data: [newTicket], paging: {} };
        return {
          ...old,
          data: [...old.data, newTicket]
        };
      })
      toast({ title: "Success", description: `"${newTicket.subject}" has been created successfully.`, variant: "default" });
      setCreateTicketModalOpen(false);
    },
    onError: (error: any) => {
      console.error("[Admin Tickets] Create ticket error:", error);
      toast({ title: "Failed to create ticket", description: error?.response?.data?.message || "An error occurred while creating the ticket.", variant: "destructive" });
    }
  });

  // Assign ticket mutation for admins
  const assignTicketMutation = useMutation({
    mutationFn: async (data: { assigned_to_user_id: string; status: string; priority: string }) => {
      console.debug("[Admin Tickets] Assigning ticket:", { ticketId: selectedTicketForAssignment?.id, data });
      const res = await ticketsApi.assignTicket(
        selectedTicketForAssignment?.id, 
        data.assigned_to_user_id, 
        data.status, 
        data.priority
      );
      console.debug("[Admin Tickets] Assign ticket response:", res.data);
      return res.data.data;
    },
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(["tickets", userRole], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((ticket: any) =>
            ticket.id === updatedTicket.id ? updatedTicket : ticket
          )
        };
      })
      toast({ title: "Success", description: `Ticket assigned successfully.`, variant: "default" });
      setAssignTicketModalOpen(false);
      setSelectedTicketForAssignment(null);
    },
    onError: (error: any) => {
      console.error("[Admin Tickets] Assign ticket error:", error);
      console.error("[Admin Tickets] Error response:", error?.response?.data);
      console.error("[Admin Tickets] Error response details:", JSON.stringify(error?.response?.data, null, 2));
      console.error("[Admin Tickets] Error status:", error?.response?.status);
      console.error("[Admin Tickets] Error headers:", error?.response?.headers);
      console.error("[Admin Tickets] User role:", userRole);
      console.error("[Admin Tickets] Request URL:", error?.config?.url);
      console.error("[Admin Tickets] Request method:", error?.config?.method);
      console.error("[Admin Tickets] Request headers:", error?.config?.headers);
      console.error("[Admin Tickets] Request data:", error?.config?.data);
      console.error("[Admin Tickets] Full error object:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Failed to assign ticket.";
      
      if (error?.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to assign tickets. This might be due to insufficient permissions or the backend requiring additional authorization.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Assignment Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ ticketId, body, isInternal }: { ticketId: string; body: string; isInternal: boolean }) => {
      console.debug("[Tickets] Adding comment:", { ticketId, body, isInternal });
      return ticketsApi.addComment(ticketId, body, isInternal);
    },
    onSuccess: (response) => {
      console.debug("[Tickets] Comment added successfully:", response.data);
      toast({ title: "Success", description: "Reply posted successfully.", variant: "default" });
      setReplyText("");
      // Refetch comments
      if (selectedCompany?.id) {
        fetchTicketComments(selectedCompany.id);
      }
    },
    onError: (error: any) => {
      console.error("[Tickets] Add comment error:", error);
      toast({ 
        title: "Failed to post reply", 
        description: error?.response?.data?.message || "An error occurred while posting the reply.", 
        variant: "destructive" 
      });
    }
  });

  // Fetch ticket comments
  const fetchTicketComments = async (ticketId: string) => {
    try {
      const response = await ticketsApi.getComments(ticketId);
      console.debug("[Tickets] Fetched comments:", response.data);
      setComments(response.data?.data || []);
    } catch (error) {
      console.error("[Tickets] Error fetching comments:", error);
      setComments([]);
    }
  };

  // Fetch comments when modal opens with a ticket
  useEffect(() => {
    console.debug("[Tickets] Modal state changed:", { modalOpen, selectedCompany: selectedCompany?.id, userRole });
    if (modalOpen && selectedCompany?.id) {
      console.debug("[Tickets] Fetching comments for ticket:", selectedCompany.id);
      fetchTicketComments(selectedCompany.id);
    } else if (!modalOpen) {
      setComments([]);
      setReplyText("");
      setIsInternalComment(false);
    }
  }, [modalOpen, selectedCompany, userRole]);

  // 🔄 SMART REFRESH FUNCTION WITH TAB ACTIVITY AWARENESS
  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefresh;
    const timeSinceLastActivity = now - lastActivity;
    
    // Debounce: prevent refresh if last refresh was less than 2 seconds ago
    if (timeSinceLastRefresh < 2000) {
      console.log('Refresh blocked: Too frequent');
      return;
    }
    
    // Smart refresh logic: refresh if inactive for >5 minutes or if last refresh was >30 seconds ago
    const shouldRefresh = timeSinceLastActivity > 5 * 60 * 1000 || timeSinceLastRefresh > 30 * 1000;
    
    if (!shouldRefresh && !isRefreshing) {
      console.log('Refresh blocked: Data is fresh');
      return;
    }

    try {
      setIsRefreshing(true);
      setLastRefresh(now);
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [lastRefresh, lastActivity, refetch, isRefreshing]);

  // 📱 TAB VISIBILITY EFFECTS FOR PERFORMANCE MONITORING
  useEffect(() => {
    if (isVisible && lastActivity) {
      const timeSinceLastActivity = Date.now() - lastActivity;
      // Log when tab becomes active after long inactivity (10+ minutes)
      if (timeSinceLastActivity > 10 * 60 * 1000) {
        console.log('Tab became active after long inactivity, data might be stale');
      }
    }
  }, [isVisible, lastActivity]);

  // Flatten data for table
  const tableData = tickets.map((ticket: any, i: number) => ({
    ...ticket,
    no: i + 1,
    user: ticket.creator_name || "Unknown",
    description: ticket.description || "",
    date: ticket.created_at,
    status: ticket.status,
    priority: ticket.priority,
    subject: ticket.subject,
  }));

  // Table columns
  const columns = [
    { accessorKey: "no", header: "#", cell: ({ row }: any) => <span className="font-medium">{row.original.no}</span> },
    { accessorKey: "subject", header: t('subject'), cell: ({ row }: any) => <div className="font-medium">{row.original.subject}</div> },
    { accessorKey: "user", header: t('createdBy'), cell: ({ row }: any) => <div className="font-medium">{row.original.user}</div> },
    { accessorKey: "priority", header: t('priority'), cell: ({ row }: any) => {
      const priority = row.original.priority;
      const priorityColors: Record<string, string> = {
        low: "bg-gray-100 text-gray-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-orange-100 text-orange-800",
        urgent: "bg-red-100 text-red-800",
      };
      return <Badge className={priorityColors[priority] || "bg-gray-100 text-gray-800"}>{t(priority)}</Badge>;
    } },
   { accessorKey: "status", header: t('status'), cell: ({ row }: any) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        open: "bg-blue-100 text-blue-800",
        closed: "bg-green-100 text-green-800",
        in_progress: "bg-yellow-100 text-yellow-800",
        pending: "bg-gray-100 text-gray-800",
      };
      return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{t(status)}</Badge>;
    } },
    { accessorKey: "assignee_name", header: t('assignedTo'), cell: ({ row }: any) => {
      const assigneeName = row.original.assignee_name;
      if (!assigneeName) {
        return <span className="text-gray-400 text-sm italic">{t('unassigned')}</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
            {assigneeName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{assigneeName}</span>
        </div>
      );
    } },
    { accessorKey: "date",
       header: t('createdAt'), 
       cell: ({ row }: any) => (
        <div className="text-gray-600">
          {new Date(row.original.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
     },   
    
     {
          id: "actions",
          header: tCommon('actions'),
          cell: ({ row }: any) => {
            const ticket = row.original
            return (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedCompany(ticket)
                    setModalOpen(true)
                  }}
                  className="hover:bg-blue-50 hover:text-blue-600"
                  title={t('view')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {(userRole === "admin" || userRole === "lawyer") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedTicketForStatusChange(ticket)
                      setNewStatus(ticket.status)
                      setNewPriority(ticket.priority)
                      setChangeStatusModalOpen(true)
                    }}
                    className="hover:bg-orange-50 hover:text-orange-600"
                    title={t('changeStatus')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {userRole === "admin" && !ticket.assigned_to_user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedTicketForAssignment(ticket)
                      setAssignTicketModalOpen(true)
                    }}
                    className="hover:bg-purple-50 hover:text-purple-600"
                    title={t('assign')}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          },
          enableSorting: false,
        },
  ];



  // Get priority color for modal
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  // Get status color for modal
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      closed: "bg-green-100 text-green-800 border-green-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pending: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <DashboardLayout title={t('title')} isFetching={isFetching}>
      <div className="p-0"> 
        
        <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold">{t('pageTitle')}</h1>
            <p className="text-sm text-gray-400">{t('pageSubtitle')}</p>
          </div>
          {userRole === "user" && (
          <Button
              onClick={() => setCreateTicketModalOpen(true)}
            className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('createTicket')}
          </Button>
          )}
          </div>
          <hr></hr>

          {/* Table View for All Roles */}
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={tableData}
              quickFilterKey="status"
              quickFilterLabel={t('status')}
              searchKey="subject"
              searchPlaceholder={t('searchPlaceholder')}
            />
          </div>
        </div>
        {/* Ticket Details Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{t('ticketDetails')} & {t('replies')}</DialogTitle>
            </DialogHeader>
            
            {selectedCompany && (
              <div className="space-y-6">
                {/* Ticket Information Card */}
                <Card className="border-l-4" style={{
                  borderLeftColor: selectedCompany.priority === 'urgent' ? '#ef4444' : 
                                  selectedCompany.priority === 'high' ? '#f97316' :
                                  selectedCompany.priority === 'medium' ? '#eab308' : '#6b7280'
                }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedCompany.subject}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {selectedCompany.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(selectedCompany.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(selectedCompany.priority)}`}>
                          {selectedCompany.priority.charAt(0).toUpperCase() + selectedCompany.priority.slice(1)}
                        </Badge>
                        <Badge className={`${getStatusColor(selectedCompany.status)}`}>
                          {selectedCompany.status.replace('_', ' ').charAt(0).toUpperCase() + selectedCompany.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('description')}</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {selectedCompany.description || t('noDescription')}
                      </p>
                </div>
                
                {selectedCompany.tags && selectedCompany.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('tags')}</h4>
                        <div className="flex flex-wrap gap-2">
                      {selectedCompany.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                    {/* Assignee Information */}
                    {selectedCompany.assignee_name && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('assignment')}</h4>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                            {selectedCompany.assignee_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">{t('assignedTo')}</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedCompany.assignee_name}</p>
                            <p className="text-xs text-gray-500">{selectedCompany.assignee_email}</p>
                          </div>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-900 border-purple-200">
                            {t('assigned')}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comments/Replies Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t('replies')} & {t('comments')} {comments.length > 0 && `(${comments.length})`}
                    </h4>
                  </div>

                  {/* Comments List */}
                  {comments.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {comments.map((comment: any, idx: number) => (
                        <Card key={idx} className={`${comment.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-gray-50'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                  {comment.author_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{comment.author_name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              {comment.is_internal && (
                                <Badge variant="secondary" className="text-xs bg-amber-200 text-amber-900">
                                  {t('internal')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{t('noRepliesYet')}</p>
              </div>
            )}

                  {/* Reply Input Section for Admins/Lawyers */}
                  {(userRole === "admin" || userRole === "lawyer") && (
                    <Card className="border-blue-200 bg-blue-50/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-gray-900">{t('addReply')}</h5>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="internal-comment"
                              checked={isInternalComment}
                              onChange={(e) => setIsInternalComment(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="internal-comment" className="text-xs text-gray-600 cursor-pointer flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {t('internalNote')}
                            </label>
                          </div>
                        </div>
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t('typeReplyHere')}
                          className="w-full min-h-[100px] resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyText("");
                              setIsInternalComment(false);
                            }}
                            disabled={!replyText.trim() || addCommentMutation.isPending}
                          >
                            {tCommon('clear')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (replyText.trim() && selectedCompany?.id) {
                                addCommentMutation.mutate({
                                  ticketId: selectedCompany.id,
                                  body: replyText.trim(),
                                  isInternal: isInternalComment
                                });
                              }
                            }}
                            disabled={!replyText.trim() || addCommentMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {addCommentMutation.isPending ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                {t('posting')}
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                {t('postReply')}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={addCommentMutation.isPending}>
                {tCommon('close')}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Create Ticket Modal for Users */}
        {userRole === "user" && (
          <CreateTicketModal 
            open={createTicketModalOpen}
            onOpenChange={setCreateTicketModalOpen}
            onSubmit={(data) => {
              createTicketMutation.mutate(data)
            }}
            isLoading={createTicketMutation.isPending}
          />
        )}
        
        {/* Assign Ticket Modal for Admins */}
        {userRole === "admin" && (
          <AssignTicketModal 
            open={assignTicketModalOpen}
            onOpenChange={setAssignTicketModalOpen}
            onSubmit={(data) => {
              assignTicketMutation.mutate(data)
            }}
            isLoading={assignTicketMutation.isPending}
            ticket={selectedTicketForAssignment}
          />
        )}

        {/* Change Status/Priority Modal */}
        <Dialog open={changeStatusModalOpen} onOpenChange={setChangeStatusModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">{t('changeStatus')} & {t('priority')}</DialogTitle>
            </DialogHeader>
            
            {selectedTicketForStatusChange && (
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{selectedTicketForStatusChange.subject}</h3>
                  <p className="text-xs text-gray-600">{t('ticketId')}: {selectedTicketForStatusChange.id}</p>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t('status')}</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {t('open')}
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          {t('in_progress')}
                        </div>
                      </SelectItem>
                      <SelectItem value="closed">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          {t('closed')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t('priority')}</label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('selectPriority')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          {t('low')}
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          {t('medium')}
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          {t('high')}
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          {t('urgent')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    {t('current')}: <strong>{t(selectedTicketForStatusChange.status)}</strong> / <strong>{t(selectedTicketForStatusChange.priority)}</strong>
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setChangeStatusModalOpen(false)
                  setSelectedTicketForStatusChange(null)
                  setNewStatus("")
                  setNewPriority("")
                }} 
                disabled={updateTicketMutation.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={() => {
                  if (selectedTicketForStatusChange?.id && (newStatus || newPriority)) {
                    updateTicketMutation.mutate({
                      id: selectedTicketForStatusChange.id,
                      status: newStatus || undefined,
                      priority: newPriority || undefined
                    })
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={updateTicketMutation.isPending || (!newStatus && !newPriority)}
              >
                {updateTicketMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    {t('updating')}
                  </>
                ) : (
                  t('updateTicket')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
