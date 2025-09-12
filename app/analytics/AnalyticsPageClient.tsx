"use client";

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, FileText, Users, Gavel, TrendingUp, DollarSign } from "lucide-react"
import { useState, useMemo } from "react"
import { dummyAnalytics, dummyUsers, dummyTenders, dummyBids } from "@/lib/dummy-data"
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

  // DUMMY DATA: Calculate analytics from dummy data
  const analytics = useMemo(() => {
    const totalCompanies = dummyUsers.filter(u => u.role === 'company').length
    const totalTenders = dummyTenders.length
    const totalBids = dummyBids.length
    const activeTenders = dummyTenders.filter(t => t.status === 'open').length
    
    return {
      totalRevenue: dummyAnalytics.totalRevenue,
      documentSales: dummyAnalytics.documentSales,
      subscriptionRevenue: dummyAnalytics.subscriptionRevenue,
      totalBids: totalBids,
      totalTenders: totalTenders,
      totalCompanies: totalCompanies,
      activeTenders: activeTenders,
      period: dummyAnalytics.period
    }
  }, [])

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`ETB ${analytics.totalRevenue.toLocaleString()}`}
            subtitle="Total Sales Revenue"
            icon={<DollarSign className="w-8 h-8 text-white" />}
            period={periods.totalRevenue}
            onPeriodChange={(period) => updatePeriod("totalRevenue", period)}
          />

          <MetricCard
            title="Document Sales"
            value={`ETB ${analytics.documentSales.toLocaleString()}`}
            subtitle="Document Revenue"
            icon={<FileText className="w-8 h-8 text-white" />}
            period={periods.documentSales}
            onPeriodChange={(period) => updatePeriod("documentSales", period)}
          />

          <MetricCard
            title="Subscription Revenue"
            value={`ETB ${analytics.subscriptionRevenue.toLocaleString()}`}
            subtitle="Subscription Income"
            icon={<TrendingUp className="w-8 h-8 text-white" />}
            period={periods.subscriptionRevenue}
            onPeriodChange={(period) => updatePeriod("subscriptionRevenue", period)}
          />

          <MetricCard
            title="Total Bids"
            value={analytics.totalBids.toString()}
            subtitle="Submitted Bids"
            icon={<Gavel className="w-8 h-8 text-white" />}
            period={periods.totalBids}
            onPeriodChange={(period) => updatePeriod("totalBids", period)}
          />

          <MetricCard
            title="Total Tenders"
            value={analytics.totalTenders.toString()}
            subtitle="Published Tenders"
            icon={<FileText className="w-8 h-8 text-white" />}
            period={periods.totalBids}
            onPeriodChange={(period) => updatePeriod("totalBids", period)}
          />

          <MetricCard
            title="Active Companies"
            value={analytics.totalCompanies.toString()}
            subtitle="Registered Companies"
            icon={<Building2 className="w-8 h-8 text-white" />}
            period={periods.totalBids}
            onPeriodChange={(period) => updatePeriod("totalBids", period)}
          />
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Analytics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Tenders:</span>
                    <span className="font-medium">{analytics.activeTenders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate:</span>
                    <span className="font-medium text-green-600">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Bid Value:</span>
                    <span className="font-medium">ETB 45,000</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">{analytics.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate:</span>
                    <span className="font-medium text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4">Data from {analytics.period} • Updated in real-time</div>
      </div>
    </DashboardLayout>
  )
} 