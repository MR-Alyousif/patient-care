"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartBar, ChartLine } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"

interface SystemMetrics {
  queueLength: number
  averageServiceTime: number
  averageWaitTime: number
  timestamp: string
}

interface PrescriptionMetrics {
  prescriptionCount: number
  medicineStats: { name: string; count: number }[]
  patientCount: number
  stockLevels: { medicine: string; level: number }[]
}

export default function DashboardPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([])
  const [prescriptionMetrics, setPrescriptionMetrics] = useState<PrescriptionMetrics | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    // Fetch initial data and set up polling
    const fetchData = async () => {
      try {
        const [systemRes, prescriptionRes] = await Promise.all([
          fetch("/api/metrics/system"),
          fetch("/api/metrics/prescriptions")
        ])
        
        const systemData = await systemRes.json()
        const prescriptionData = await prescriptionRes.json()
        
        setSystemMetrics(systemData)
        setPrescriptionMetrics(prescriptionData)
      } catch (error) {
        console.error("Error fetching metrics:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const systemChartConfig = {
    queueLength: {
      label: "Queue Length",
      color: "#2563eb",
    },
    serviceTime: {
      label: "Service Time",
      color: "#16a34a",
    },
    waitTime: {
      label: "Wait Time",
      color: "#dc2626",
    },
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Remote Dashboard</h1>
      
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System Performance</TabsTrigger>
          <TabsTrigger value="prescription">Prescription Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Current Queue Length</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.queueLength || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Service Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.averageServiceTime || 0}m
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Wait Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.averageWaitTime || 0}m
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Metrics Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={systemChartConfig}
                >
                  <ChartLine
                    data={systemMetrics}
                    index="timestamp"
                    categories={["queueLength", "averageServiceTime", "averageWaitTime"]}
                    colors={["#2563eb", "#16a34a", "#dc2626"]}
                    valueFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip />
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescription" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      prescriptions: {
                        label: "Prescriptions",
                        color: "#2563eb",
                      },
                    }}
                  >
                    <ChartBar
                      data={prescriptionMetrics?.medicineStats || []}
                      index="name"
                      categories={["count"]}
                      colors={["#2563eb"]}
                      valueFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip />
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      stock: {
                        label: "Stock Level",
                        color: "#16a34a",
                      },
                    }}
                  >
                    <ChartBar
                      data={prescriptionMetrics?.stockLevels || []}
                      index="medicine"
                      categories={["level"]}
                      colors={["#16a34a"]}
                      valueFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip />
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Total Prescriptions</p>
                  <p className="text-2xl font-bold">{prescriptionMetrics?.prescriptionCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Patients</p>
                  <p className="text-2xl font-bold">{prescriptionMetrics?.patientCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
