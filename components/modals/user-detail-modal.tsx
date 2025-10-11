"use client"

import { GlobalModal } from "./global-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User } from "@/lib/types"
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  Clock,
  X
} from "lucide-react"

interface UserDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function UserDetailModal({ open, onOpenChange, user }: UserDetailModalProps) {
  if (!user) return null

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>
    
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-[#A4D65E] text-white">Active</Badge>
      case 'suspended':
        return <Badge className="bg-[#FACC15] text-white">Suspended</Badge>
      case 'locked':
        return <Badge className="bg-[#EF4444] text-white">Locked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPackageStatusBadge = (isActive: boolean) => {
    return (
      <Badge 
        variant={isActive ? "default" : "secondary"}
        className={`font-medium ${
          isActive 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 text-red-800 border-red-200"
        }`}
      >
        {isActive ? "🟢 Active" : "🔴 Inactive"}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft
  }

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title="User Details"
      actions={
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
              {user.profileImage?.url ? (
                <img 
                  src={user.profileImage.url} 
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient background if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user.fullName || user.name || 'Unknown User'}</h3>
              <p className="text-sm text-gray-500 mb-2">User ID: {user._id || user.id}</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(user.status || (user.is_active ? 'active' : 'inactive'))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{user.phoneNumber || user.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Account Information
          </h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Joined:</span> {(user.createdAt || user.created_at) ? formatDate((user.createdAt || user.created_at)!) : 'N/A'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Location Information */}
        {user.address && (
          <>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">{user.address.city || 'N/A'}</span>, {user.address.country || 'N/A'}
                </p>
              </div>
            </div>
            
            <Separator />
          </>
        )}

        {/* Package Information */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Package Details
          </h4>
          
          {user.entitlement ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">Package Name</p>
                  <p className="text-sm font-semibold text-blue-800">{user.entitlement.packageName}</p>
                  <p className="text-xs text-blue-500">ID: {user.entitlement.packageId}</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 font-medium">Status</p>
                  <div className="mt-1">
                    {getPackageStatusBadge(user.entitlement.isActive)}
                  </div>
                </div>
              </div>
              
              {user.entitlement.endsAt && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-xs text-orange-600 font-medium">Expiration</p>
                  </div>
                  <p className="text-sm font-semibold text-orange-800">
                    {formatDate(user.entitlement.endsAt)}
                  </p>
                  {(() => {
                    const daysLeft = getDaysLeft(user.entitlement.endsAt)
                    const isExpired = daysLeft < 0
                    return (
                      <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                        {isExpired ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
                      </p>
                    )
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">No active package</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {user.description && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-800">Description</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{user.description}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </GlobalModal>
  )
}
