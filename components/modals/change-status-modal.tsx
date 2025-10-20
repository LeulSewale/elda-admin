"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { requestsApi } from "@/lib/api/requests"
import { useTranslations } from 'next-intl'

type ChangeStatusModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  currentStatus: string
  onSuccess?: () => void
}

export function ChangeStatusModal({ 
  open, 
  onOpenChange, 
  requestId, 
  currentStatus,
  onSuccess 
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [remarks, setRemarks] = useState("")
  
  // Translation hooks
  const t = useTranslations('requests');
  const tCommon = useTranslations('common');

  const handleStatusChange = async () => {
    if (!newStatus) {
      alert(t('pleaseSelectStatus'))
      return
    }

    try {
      await requestsApi.patchRequest(requestId, {
        status: newStatus,
        remarks: remarks || `${t('statusChangedTo')} ${t(newStatus)}`
      })
      
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setNewStatus(currentStatus)
      setRemarks("")
    } catch (error) {
      console.error("[Change Status] Error:", error)
      alert(t('failedToChangeStatus'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#4082ea] font-semibold">{t('changeStatus')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t('currentStatus')}</Label>
            <div className="p-2 bg-gray-100 rounded text-sm">
              {t(currentStatus)}
            </div>
          </div>

          <div>
            <Label>{t('newStatus')} *</Label>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectNewStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="pending" value="pending">{t('pending')}</SelectItem>
                <SelectItem key="approved" value="approved">{t('approved')}</SelectItem>
                <SelectItem key="rejected" value="rejected">{t('rejected')}</SelectItem>
                <SelectItem key="closed" value="closed">{t('closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('remarks')}</Label>
            <Textarea
              placeholder={t('addRemarksAboutStatusChange')}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            className="bg-[#4082ea] hover:bg-[#306ad1]"
            onClick={handleStatusChange}
            disabled={!newStatus || newStatus === currentStatus}
          >
            {t('changeStatus')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
