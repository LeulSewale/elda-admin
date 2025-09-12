"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Search, Filter, Download, Plus } from "lucide-react"

// Document type definition
interface Document {
  id: string
  title: string
  type: string
  fileId: string
  date: string
  status: 'Read' | 'Unread'
}

// Dummy documents data for ELDA legal services
const dummyDocuments: Document[] = [
  {
    id: "1",
    title: "Disability Rights Act 2024",
    type: "DOCX",
    fileId: "XB129",
    date: "2024-06-26",
    status: "Read"
  },
  {
    id: "2", 
    title: "Employment Law Guidelines",
    type: "PDF",
    fileId: "XD841",
    date: "2024-06-25",
    status: "Unread"
  },
  {
    id: "3",
    title: "Accessibility Standards Manual",
    type: "PDF", 
    fileId: "XF923",
    date: "2024-06-24",
    status: "Read"
  },
  {
    id: "4",
    title: "Legal Advocacy Procedures",
    type: "DOCX",
    fileId: "XH456",
    date: "2024-06-23", 
    status: "Unread"
  },
  {
    id: "5",
    title: "Social Security Guidelines",
    type: "PDF",
    fileId: "XJ789",
    date: "2024-06-22",
    status: "Read"
  },
  {
    id: "6",
    title: "Court Representation Manual",
    type: "DOCX",
    fileId: "XL012",
    date: "2024-06-21",
    status: "Unread"
  },
  {
    id: "7",
    title: "Client Rights Documentation",
    type: "PDF",
    fileId: "XN345",
    date: "2024-06-20",
    status: "Read"
  },
  {
    id: "8",
    title: "Legal Forms and Templates",
    type: "DOCX", 
    fileId: "XP678",
    date: "2024-06-19",
    status: "Unread"
  }
]

// Column definitions for the documents table
const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "id",
    header: "No",
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("title")}</span>
    },
  },
  {
    accessorKey: "type", 
    header: "Type",
    cell: ({ row }) => {
      return <span className="text-gray-600">{row.getValue("type")}</span>
    },
  },
  {
    accessorKey: "fileId",
    header: "ID",
    cell: ({ row }) => {
      return <span className="text-gray-600">{row.getValue("fileId")}</span>
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return <span className="text-gray-600">{date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={status === "Read" ? "secondary" : "default"}
          className={status === "Read" ? "bg-gray-100 text-gray-800" : "bg-[#A4D65E] text-white"}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button 
          variant="link" 
          className="text-[#A4D65E] p-0 h-auto font-normal"
          onClick={() => {
            // Handle view details action
            console.log("View details for:", row.original)
          }}
        >
          View Details
        </Button>
      )
    },
  },
]

export function TendersPageClient() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage and access legal documents and resources</p>
        </div>
        <Button className="bg-[#A4D65E] hover:bg-[#8BC34A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border">
        <DataTable
          columns={columns}
          data={dummyDocuments}
        />
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="default" size="sm" className="bg-[#A4D65E] text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <span className="text-gray-500 mx-2">...</span>
              <Button variant="outline" size="sm">
                8
              </Button>
              <Button variant="outline" size="sm">
                9
              </Button>
              <Button variant="outline" size="sm">
                10
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
            
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">8</span> of <span className="font-medium">120 Entries</span>
          </div>
        </div>
      </div>
    </div>
  )
}
              <DetailField label="Bank Name" value={tender.CPO.bankName} />
              <DetailField label="Account Number" value={tender.CPO.accountNumber} />
            </div>
          </div>
        )}

          {/* Required Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-gray-800">Required Documents</h3>
              <Badge variant="outline" className="bg-gray-50">{tender.requiredDocumentTypes?.length || 0} total</Badge>
            </div>
            {!tender.requiredDocumentTypes || tender.requiredDocumentTypes.length === 0 ? (
              <div className="text-gray-400 text-[13px]">No required documents.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tender.requiredDocumentTypes.map((docType, idx) => {
                  const label = ['national_id','business_license','competency_certificate','tin_certification','bank_statement'].includes(docType)
                    ? docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : docType;
                  return (
                    <Badge key={idx} variant="secondary" className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                      {label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                <File className="w-4 h-4 text-gray-600" /> Documents
              </h3>
              <Badge variant="outline" className="bg-gray-50">{tender.documents?.length || 0} files</Badge>
            </div>
            {!tender.documents || tender.documents.length === 0 ? (
              <div className="text-gray-400 text-[13px]">No documents uploaded.</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
              {tender.documents.map((doc, i) => {
                const fileType = getFileType(doc.url);
                const getFileIcon = (type: string) => {
                  switch (type) {
                    case 'image': return '🖼️';
                    case 'pdf': return '📄';
                    case 'word': return '📝';
                    case 'excel': return '📊';
                    case 'powerpoint': return '📈';
                    case 'text': return '📃';
                    default: return '📎';
                  }
                };
                
                return (
                  <div key={doc.publicId || i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-lg flex-shrink-0">{getFileIcon(fileType)}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[13px] text-gray-800 truncate block">{doc.name}</span>
                        <span className="text-[11px] text-gray-500 capitalize">{fileType} file</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => downloadDocument(doc.url, doc.name)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Download document"
                      >
                        <Download className="w-4 h-4 text-green-600 hover:text-green-700" />
                      </button>
                      <button
                        onClick={() => {
                          setPreview({ url: doc.url, name: doc.name });
                          setPreviewError(false);
                          setPreviewFallback(false);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="View document"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
          {/* Inline document preview dialog */}
          <Dialog open={!!preview} onOpenChange={(o) => {
            if (!o) {
              setPreview(null);
              setPreviewError(false);
              setPreviewFallback(false);
            }
          }}>
            <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <File className="w-4 h-4" />
                  {preview?.name || 'Document Preview'}
                </DialogTitle>
              </DialogHeader>
              <div className="w-full h-[60vh] rounded-md overflow-hidden border bg-gray-50">
                {preview && (() => {
                  const fileType = getFileType(preview.url);
                  
                  switch (fileType) {
                    case 'image':
                      return (
                        <img 
                          src={preview.url} 
                          alt={preview.name || 'document'} 
                          className="w-full h-full object-contain bg-gray-50" 
                        />
                      );
                    case 'pdf':
                      return (
                        <div className="w-full h-full bg-white">
                          {!previewError ? (
                            <div className="w-full h-full">
                              {!previewFallback ? (
                                // Try direct PDF first
                                <iframe 
                                  src={`${preview.url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                                  title="PDF Preview" 
                                  className="w-full h-full border-0" 
                                  referrerPolicy="no-referrer"
                                  sandbox="allow-same-origin allow-scripts allow-forms"
                                  onError={() => {
                                    // If direct PDF fails, try Google Docs viewer
                                    setPreviewFallback(true);
                                  }}
                                  onLoad={() => setPreviewError(false)}
                                />
                              ) : (
                                // Try Google Docs viewer as fallback
                                <iframe 
                                  src={getPdfViewerUrl(preview.url)}
                                  title="PDF Preview Fallback" 
                                  className="w-full h-full border-0" 
                                  referrerPolicy="no-referrer"
                                  sandbox="allow-same-origin allow-scripts allow-forms"
                                  onError={() => setPreviewError(true)}
                                  onLoad={() => setPreviewError(false)}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <div className="text-center px-4">
                                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">PDF preview not available</p>
                                <p className="text-sm text-gray-500 mb-6">{preview.name}</p>
                                <div className="flex gap-3 justify-center">
                                  <Button 
                                    onClick={() => openFileInNewTab(preview.url, preview.name)}
                                    variant="outline"
                                    className="min-w-[140px]"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open in New Tab
                                  </Button>
                                  <Button 
                                    onClick={() => downloadDocument(preview.url, preview.name || 'document')}
                                    className="bg-[#A4D65E] hover:bg-[#95C653] min-w-[140px]"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    case 'text':
                      return (
                        <div className="w-full h-full bg-white p-4 overflow-auto">
                          <iframe 
                            src={preview.url}
                            title="Text Preview" 
                            className="w-full h-full border-0" 
                            referrerPolicy="no-referrer"
                            sandbox="allow-same-origin allow-scripts"
                          />
                        </div>
                      );
                    case 'word':
                    case 'excel':
                    case 'powerpoint':
                      return (
                        <iframe 
                          src={buildPreviewUrl(preview.url)}
                          title="Office Document Preview" 
                          className="w-full h-full border-0" 
                          referrerPolicy="no-referrer"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                      );
                    default:
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Preview not available for this file type</p>
                            <p className="text-sm text-gray-500">{preview.name}</p>
                          </div>
                        </div>
                      );
                  }
                })()}
              </div>
              <DialogFooter className="pt-4 pb-2">
                {preview && (
                  <div className="flex items-center gap-3 w-full justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => openFileInNewTab(preview.url, preview.name)}
                      className="min-w-[140px]"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in new tab
                    </Button>
                    <Button 
                      onClick={() => downloadDocument(preview.url, preview.name || 'document')} 
                      className="bg-[#A4D65E] hover:bg-[#95C653] min-w-[140px]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper for clean field display
function DetailField({ label, value, fullWidth }: { label: string; value: any; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</div>
      <div className="text-[15px] text-gray-900 break-words whitespace-pre-line bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">{value || '-'}</div>
    </div>
  );
}

export function TendersPageClient() {
  // Grouped modal and status state
  const [modalState, setModalState] = useState<ModalState>({ create: false, edit: false, status: false });
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [statusState, setStatusState] = useState<StatusState>({ pendingStatus: null, pendingTender: null });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTender, setDetailTender] = useState<Tender | null>(null);
  const [topTenderModalOpen, setTopTenderModalOpen] = useState(false);
  const [selectedTenderForTop, setSelectedTenderForTop] = useState<Tender | null>(null);
  const [topTenderLoading, setTopTenderLoading] = useState(false);
  // Server-side pagination state for DataTable
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(10);

  const downloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const queryClient = useQueryClient();
  
  // ✅ DUMMY DATA: Proper mutation with dummy data
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      return createApiResponse({ id, status }, 'Tender status updated successfully');
    },
    onSuccess: (_, { id, status }) => {
      // ✅ OPTIMIZED: Update specific tender in cache instead of invalidating all
      queryClient.setQueryData(
        ["tenders", pageIndex, pageSize, role],
        (oldData: any) => {
          if (!oldData?.tenders) return oldData;
          return {
            ...oldData,
            tenders: oldData.tenders.map((tender: Tender) =>
              (tender._id || tender.id) === id 
                ? { ...tender, status } 
                : tender
            )
          };
        }
      );
      setModalState((s) => ({ ...s, status: false }));
      setStatusState({ pendingStatus: null, pendingTender: null });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const { role, user } = useAuth();

  // ✅ OPTIMIZED: Simplified query key structure
  const queryKey = ["tenders", pageIndex, pageSize, role];
  
  // ✅ DUMMY DATA: Query with dummy data
  const { data, isLoading, error, isFetching } = useQuery<{ tenders: Tender[]; pagination: PaginationType } | undefined>({
    queryKey,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600)) // Simulate API delay
      if (role === "admin") {
        const paginatedData = createPaginatedResponse(dummyTenders, pageIndex + 1, pageSize);
        return { tenders: paginatedData.data, pagination: { ...paginatedData.pagination, hasNextPage: paginatedData.pagination.page < paginatedData.pagination.totalPages, hasPrevPage: paginatedData.pagination.page > 1 } };
      } else if (role === "company" && user && typeof user === 'object' && '_id' in user) {
        const companyTenders = dummyTenders.filter(tender => typeof tender.company === 'object' && tender.company._id === (user as any)._id);
        const paginatedData = createPaginatedResponse(companyTenders, pageIndex + 1, pageSize);
        return { tenders: paginatedData.data, pagination: { ...paginatedData.pagination, hasNextPage: paginatedData.pagination.page < paginatedData.pagination.totalPages, hasPrevPage: paginatedData.pagination.page > 1 } };
      }
      return { tenders: [], pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    },
    // ✅ OPTIMIZED: Proper caching configuration
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes - keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false,      // Don't refetch on component mount if data exists
    refetchOnReconnect: true,   // Only refetch on network reconnect
  });

  const tenders: Tender[] = data?.tenders || [];
  const pagination: PaginationType = data?.pagination || {
    page: pageIndex + 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // ✅ OPTIMIZED: Proper refresh function with error handling
  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh tenders. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ✅ OPTIMIZED: Memoized expensive computations
  const topTendersCount = useMemo(() => tenders.filter(t => t.isTop).length, [tenders]);
  const hasTopTenders = useMemo(() => topTendersCount > 0, [topTendersCount]);

  // Handler for DataTable pagination
  const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };

  // Handlers
  const handleEdit = (tender: Tender) => {
    setSelectedTender(tender);
    setModalState((s) => ({ ...s, edit: true }));
  };
  const handleDelete = (tender: Tender) => {
    setStatusState({ pendingStatus: 'deleted', pendingTender: tender });
    setModalState((s) => ({ ...s, status: true }));
  };
  const handleStatusChange = (tender: Tender, newStatus: string) => {
    setStatusState({ pendingStatus: newStatus, pendingTender: tender });
    setModalState((s) => ({ ...s, status: true }));
  };

  const handleTopTender = (tender: Tender) => {
    // Additional security check - only admin can access this functionality
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can modify top tender status",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedTenderForTop(tender);
    setTopTenderModalOpen(true);
  };

  const confirmTopTender = async () => {
    if (!selectedTenderForTop) return;
    
    // Additional security check - only admin can execute this action
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can modify top tender status",
        variant: "destructive",
      });
      setTopTenderModalOpen(false);
      setSelectedTenderForTop(null);
      return;
    }
    
    setTopTenderLoading(true);
    try {
      const newIsTopValue = !selectedTenderForTop.isTop;
      await new Promise(resolve => setTimeout(resolve, 600)) // Simulate API delay
      // Simulate API call with dummy data
      const response = createApiResponse({ id: selectedTenderForTop._id || selectedTenderForTop.id, isTop: newIsTopValue }, 'Top tender status updated');
      
      // ✅ DUMMY DATA: Update cache directly with dummy data
      queryClient.setQueryData(
        queryKey,
        (oldData: any) => {
          if (!oldData?.tenders) return oldData;
          return {
            ...oldData,
            tenders: oldData.tenders.map((tender: Tender) =>
              (tender._id || tender.id) === (selectedTenderForTop._id || selectedTenderForTop.id)
                ? { ...tender, isTop: newIsTopValue }
                : tender
            )
          };
        }
      );
      
      toast({
        title: "Success",
        description: `Tender ${newIsTopValue ? 'marked as top' : 'removed from top'} successfully`,
        variant: "default",
      });
      
      setTopTenderModalOpen(false);
      setSelectedTenderForTop(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update top tender status",
        variant: "destructive",
      });
    } finally {
      setTopTenderLoading(false);
    }
  };

  const columns: ColumnDef<Tender, any>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      accessorKey: "referenceNumber",
      header: "Reference #",
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const tender = row.original as Tender;
        return (
          <div className="flex items-center gap-2">
            <span className="truncate">{tender.title}</span>
            {tender.isTop && (
              <div className="flex-shrink-0 group relative">
                <Crown className="w-4 h-4 text-yellow-500 fill-current animate-pulse" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  👑 Top Tender
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "company.fullName",
      header: "Company",
      cell: ({ row }) => (row.original.company as any)?.fullName || "-",
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => (row.original.category as any)?.name || "-",
    },
    {
      accessorKey: "awardDate",
      header: "Award Date",
      cell: ({ row }) => new Date(row.getValue("awardDate")).toLocaleDateString(),
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => new Date(row.getValue("deadline")).toLocaleDateString(),
    },
    {
      accessorKey: "isCPO",
      header: "CPO",
      cell: ({ row }) => {
        const isCPO = row.getValue("isCPO");
        return isCPO ? (
          <Badge className="bg-[#A4D65E] text-white">Yes</Badge>
        ) : (
          <Badge className="bg-gray-200 text-gray-800">No</Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const tender = row.original as Tender;
        const status = tender.status;
        let color = "";
        switch (status) {
          case "open":
            color = "bg-green-100 text-green-800";
            break;
          case "confirmed":
            color = "bg-blue-100 text-blue-800";
            break;
          case "deleted":
            color = "bg-red-100 text-red-800";
            break;
          default:
            color = "bg-gray-100 text-gray-800";
        }
        return (
          <Select
            value={status}
            onValueChange={(newStatus) => handleStatusChange(tender, newStatus)}
            disabled={status === 'deleted'}
          >
            <SelectTrigger className={`w-full ${color}`} id={`status-${tender.id}`} disabled={status === 'deleted'}>
              <SelectValue>
                {tenderStatusOptions.find(opt => opt.value === status)?.label || status}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tenderStatusOptions.map(opt => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={
                    (status === 'closed' && opt.value === 'open') ||
                    status === 'deleted'
                  }
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    
    // Removed Required Documents and Documents columns to reduce horizontal scroll
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const tender = row.original as Tender;
        const status = tender.status;
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild onClick={() => { setDetailTender(tender); setDetailModalOpen(true); }}>
              <Link href="#"><Eye className="h-4 w-4" /></Link>
            </Button>
            {role === "admin" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleTopTender(tender)}
              disabled={status === 'deleted'}
              className={tender.isTop ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"}
              title={tender.isTop ? "Remove from top" : "Mark as top tender"}
            >
              <Star className={`h-4 w-4 ${tender.isTop ? "fill-current" : ""}`} />
            </Button>
            )}
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(tender)}
                disabled={status === 'closed' || status === 'deleted'}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(tender)}
                disabled={status === 'deleted'}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Tenders" isFetching={isFetching}>
      <div className="p-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Tenders</h1>
            {hasTopTenders && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                <Crown className="w-4 h-4 text-yellow-600 fill-current" />
                <span className="text-sm font-medium text-yellow-800">
                  {topTendersCount} Top Tender{topTendersCount === 1 ? '' : 's'}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={`ml-2 border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm bg-white hover:bg-gray-50 ${isFetching ? 'cursor-wait' : ''}`}
              aria-label="Refresh tenders"
              disabled={isFetching}
            >
              <RotateCcw
                className={`w-6 h-6 stroke-[2.5] transition-transform duration-300 ${
                  isFetching ? 'animate-spin text-green-500' : 'text-gray-700 hover:text-gray-900'
                }`}
              />
            </Button>
          </div>
          <Button
            className="bg-[#A4D65E] hover:bg-[#95C653] text-white"
            onClick={() => setModalState((s) => ({ ...s, create: true }))}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tender
          </Button>
        </div>
        
        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
            </div>
          )}
          <DataTable
            columns={columns}
            data={tenders}
            searchKey="title"
            searchPlaceholder="Search by title..."
            manualPagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={pagination.totalPages}
            onPaginationChange={handlePaginationChange}
            getRowClassName={(tender: Tender) => {
              if (tender.isTop) {
                return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400 shadow-sm';
              }
              return '';
            }}
          />
        </div>
      </div>
      <GlobalModal
        open={modalState.create}
        onOpenChange={(open) => setModalState((s) => ({ ...s, create: open }))}
        title="Create Tender"
        actions={null}
      >
        <CreateTenderForm onSuccess={() => setModalState((s) => ({ ...s, create: false }))} />
      </GlobalModal>
      <GlobalModal
        open={modalState.edit}
        onOpenChange={(open) => {
          setModalState((s) => ({ ...s, edit: open }));
          if (!open) setSelectedTender(null);
        }}
        title="Edit Tender"
        actions={null}
      >
        {selectedTender && (
          <CreateTenderForm
            onSuccess={() => {
              setModalState((s) => ({ ...s, edit: false }));
              setSelectedTender(null);
            }}
            initialValues={selectedTender}
            editMode={true}
            tenderId={selectedTender.id}
          />
        )}
      </GlobalModal>
      <Dialog open={modalState.status} onOpenChange={(open) => setModalState((s) => ({ ...s, status: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to change the status to <b>{statusState.pendingStatus}</b>?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState((s) => ({ ...s, status: false }))} disabled={statusMutation.isPending}>Cancel</Button>
            <Button
              onClick={() => {
                if (statusState.pendingTender && statusState.pendingStatus) {
                  const tenderId = statusState?.pendingTender?._id || statusState?.pendingTender?.id;
                  statusMutation.mutate({ id: tenderId || '', status: statusState.pendingStatus || '' });
                }
              }}
              disabled={statusMutation.isPending}
              className={
                statusState.pendingStatus === 'deleted'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#A4D65E] hover:bg-[#95C653] text-white'
              }
            >
              {statusMutation.isPending
                ? (statusState.pendingStatus === 'deleted' ? 'Deleting...' : 'Updating...')
                : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TenderDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} tender={detailTender} downloadDocument={downloadDocument} />
      
      {/* Top Tender Confirmation Modal */}
      <Dialog open={topTenderModalOpen} onOpenChange={(open) => {
        setTopTenderModalOpen(open);
        if (!open) setSelectedTenderForTop(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {selectedTenderForTop?.isTop ? "Remove from Top" : "Mark as Top Tender"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to {selectedTenderForTop?.isTop ? "remove" : "mark"} the tender 
              <span className="font-semibold text-gray-900"> "{selectedTenderForTop?.title}" </span>
              {selectedTenderForTop?.isTop ? "from top tenders?" : "as a top tender?"}
            </p>
            {!selectedTenderForTop?.isTop && (
              <p className="text-sm text-gray-500 mt-2">
                Top tenders will be highlighted and appear prominently in the tender listings.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTopTenderModalOpen(false)}
              disabled={topTenderLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmTopTender}
              disabled={topTenderLoading}
              className={selectedTenderForTop?.isTop 
                ? "bg-gray-600 hover:bg-gray-700 text-white" 
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }
            >
              {topTenderLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedTenderForTop?.isTop ? "Removing..." : "Marking..."}
                </>
              ) : (
                selectedTenderForTop?.isTop ? "Remove from Top" : "Mark as Top"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
