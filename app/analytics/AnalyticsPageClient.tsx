"use client";

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, FileText } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  period: "Year" | "Monthly" | "Daily"
  onPeriodChange: (period: "Year" | "Monthly" | "Daily") => void
}

function MetricCard({ title, value, subtitle, icon, period, onPeriodChange }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className="flex rounded-lg bg-gray-100 p-1">
            {(["Year", "Monthly", "Daily"] as const).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                onClick={() => onPeriodChange(p)}
                className={cn(
                  "h-7 px-3 text-xs",
                  period === p ? "bg-[#A4D65E] text-white hover:bg-[#95C653]" : "text-gray-600 hover:text-gray-900",
                )}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-gray-600">{subtitle}</div>
          </div>
          <div className="w-16 h-16 bg-[#A4D65E] rounded-lg flex items-center justify-center">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsPageClient() {
  const [periods, setPeriods] = useState({
    totalRevenue: "Year" as const,
    documentSales: "Year" as const,
    subscriptionRevenue: "Year" as const,
    totalBids: "Year" as const,
  })

  const updatePeriod = (metric: keyof typeof periods, period: "Year" | "Monthly" | "Daily") => {
    setPeriods((prev) => ({ ...prev, [metric]: period }))
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Total Revenue"
            value="24,000,000"
            subtitle="Total Sales"
            icon={<Building2 className="w-8 h-8 text-white" />}
            period={periods.totalRevenue}
            onPeriodChange={(period) => updatePeriod("totalRevenue", period)}
          />

          <MetricCard
            title="Document Sales"
            value="8,500,000"
            subtitle="Total Sales"
            icon={<FileText className="w-8 h-8 text-white" />}
            period={periods.documentSales}
            onPeriodChange={(period) => updatePeriod("documentSales", period)}
          />

          <MetricCard
            title="Subscription Revenue"
            value="8,500,000"
            subtitle="Subscription Revenue"
            icon={<FileText className="w-8 h-8 text-white" />}
            period={periods.subscriptionRevenue}
            onPeriodChange={(period) => updatePeriod("subscriptionRevenue", period)}
          />

          <MetricCard
            title="Total Bids"
            value="240"
            subtitle="Bids"
            icon={<Building2 className="w-8 h-8 text-white" />}
            period={periods.totalBids}
            onPeriodChange={(period) => updatePeriod("totalBids", period)}
          />
            <MetricCard
            title="Total Tenders"
            value="240"
            subtitle="Bids"
            icon={<Building2 className="w-8 h-8 text-white" />}
            period={periods.totalBids}
            onPeriodChange={(period) => updatePeriod("totalBids", period)}
          />
            <MetricCard
            title="Total Companies"
            value="240"
            subtitle="Bids"
            icon={<Building2 className="w-8 h-8 text-white" />}
            period={periods.totalBids}
            onPeriodChange={(period) => updatePeriod("totalBids", period)}
          />
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">12 Oct 2024 - 12 Dec 2025</div>
      </div>
    </DashboardLayout>
  )
} 