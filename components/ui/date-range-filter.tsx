"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void
  className?: string
}

export function DateRangeFilter({ onDateRangeChange, className }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [isOpen, setIsOpen] = useState(false)
  
  const tCommon = useTranslations('common')
  const tRequests = useTranslations('requests')

  const handleDateSelect = (date: Date | undefined) => {
    if (!startDate || (startDate && endDate)) {
      // If no start date or both dates are set, set start date
      setStartDate(date)
      setEndDate(undefined)
    } else {
      // If start date is set but not end date, set end date
      setEndDate(date)
      setIsOpen(false)
      
      // Format dates and call the callback
      const start = startDate ? format(startDate, 'yyyy-MM-dd') : null
      const end = date ? format(date, 'yyyy-MM-dd') : null
      onDateRangeChange(start, end)
    }
  }

  const clearDates = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onDateRangeChange(null, null)
  }

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`
    } else if (startDate) {
      return `${format(startDate, 'MMM dd, yyyy')} - ...`
    }
    return tRequests('selectDateRange')
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleDateSelect}
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            initialFocus
          />
          {startDate && !endDate && (
            <div className="p-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {tRequests('selectEndDate')}
              </p>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date)
                  setIsOpen(false)
                  if (date) {
                    const start = format(startDate, 'yyyy-MM-dd')
                    const end = format(date, 'yyyy-MM-dd')
                    onDateRangeChange(start, end)
                  }
                }}
                disabled={(date) => 
                  date > new Date() || 
                  date < new Date("1900-01-01") ||
                  (startDate && date < startDate)
                }
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearDates}
          className="text-muted-foreground hover:text-foreground"
        >
          {tCommon('clear')}
        </Button>
      )}
    </div>
  )
}

