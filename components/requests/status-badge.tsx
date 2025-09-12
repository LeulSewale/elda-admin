import { Badge } from "@/components/ui/badge"
import { RequestStatus } from "@/lib/types/requests"
import { CheckCircle2, Clock, AlertCircle, XCircle, HelpCircle } from "lucide-react"

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: <Clock className="h-3 w-3 mr-1" />,
      variant: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    },
    in_progress: {
      label: 'In Progress',
      icon: <HelpCircle className="h-3 w-3 mr-1" />,
      variant: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    },
    completed: {
      label: 'Completed',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      variant: 'bg-green-100 text-green-800 hover:bg-green-200',
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle className="h-3 w-3 mr-1" />,
      variant: 'bg-red-100 text-red-800 hover:bg-red-200',
    },
    cancelled: {
      label: 'Cancelled',
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
      variant: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.variant} ${className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}
