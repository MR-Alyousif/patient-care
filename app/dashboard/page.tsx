"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/services/external-api"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        // Fetch system metrics
        const systemData = await api.metrics.system();
        setSystemMetrics(systemData);

        // Fetch prescription metrics
        const prescriptionData = await api.metrics.prescription();

        // Fetch current stock levels
        const stockData = await api.medicines.getStock();
        const stockLevels = stockData.data.map(item => ({
          medicine: item.name,
          level: item.stock_quantity
        }));

        // Fetch medicine usage statistics
        const usageData = await api.medicines.getUsage();
        const medicineStats = usageData.data.map(item => ({
          name: item.name,
          count: item.used_quantity
        }));
        
        setPrescriptionMetrics({
          prescriptionCount: prescriptionData.totalPrescriptions,
          medicineStats,
          patientCount: prescriptionData.uniquePatients,
          stockLevels,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const systemChartConfig = {
    queueLength: {
      label: "Queue Length",
      color: "hsl(var(--chart-1))",
    },
    serviceTime: {
      label: "Service Time",
      color: "hsl(var(--chart-2))",
    },
    waitTime: {
      label: "Wait Time",
      color: "hsl(var(--chart-3))",
    },
  }

  const prescriptionChartConfig = {
    count: {
      label: "Prescriptions",
      color: "hsl(var(--chart-1))",
    },
    level: {
      label: "Stock Level",
      color: "hsl(var(--chart-1))",
    },
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Loading dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-lg">{error}</p>
      </div>
    );
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
                <CardDescription>Real-time monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.queueLength ?? 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Service Time</CardTitle>
                <CardDescription>Minutes per patient</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.averageServiceTime ?? 'N/A'}m
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Wait Time</CardTitle>
                <CardDescription>Minutes in queue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.averageWaitTime ?? 'N/A'}m
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Metrics Over Time</CardTitle>
              <CardDescription>24-hour performance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {systemMetrics.length > 0 ? (
                <ChartContainer config={systemChartConfig}>
                  <AreaChart
                    data={systemMetrics}
                    margin={{ left: 12, right: 12 }}
                    height={400}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      dataKey="queueLength"
                      type="natural"
                      fill="var(--color-queue)"
                      fillOpacity={0.4}
                      stroke="var(--color-queue)"
                      stackId="a"
                    />
                    <Area
                      dataKey="averageServiceTime"
                      type="natural"
                      fill="var(--color-service)"
                      fillOpacity={0.4}
                      stroke="var(--color-service)"
                      stackId="a"
                    />
                    <Area
                      dataKey="averageWaitTime"
                      type="natural"
                      fill="var(--color-wait)"
                      fillOpacity={0.4}
                      stroke="var(--color-wait)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  No data available
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  {systemMetrics.length > 1 && (
                    <div className="flex items-center gap-2 font-medium leading-none">
                      {systemMetrics[systemMetrics.length - 1]?.queueLength > systemMetrics[0]?.queueLength ? (
                        <>Trending up <TrendingUp className="h-4 w-4" /></>
                      ) : (
                        <>Trending down <TrendingDown className="h-4 w-4" /></>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Last 24 hours
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="prescription" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Distribution</CardTitle>
                <CardDescription>Most prescribed medicines</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptionMetrics?.medicineStats && prescriptionMetrics.medicineStats.length > 0 ? (
                  <ChartContainer config={prescriptionChartConfig}>
                    <BarChart
                      data={prescriptionMetrics.medicineStats}
                      margin={{ left: 12, right: 12 }}
                      height={300}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dashed" />}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--color-prescription)"
                        radius={4}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    No prescription data available
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  Total Prescriptions: {prescriptionMetrics?.prescriptionCount ?? 'N/A'}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Current inventory status</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptionMetrics?.stockLevels && prescriptionMetrics.stockLevels.length > 0 ? (
                  <ChartContainer config={prescriptionChartConfig}>
                    <BarChart
                      data={prescriptionMetrics.stockLevels}
                      margin={{ left: 12, right: 12 }}
                      height={300}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="medicine"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dashed" />}
                      />
                      <Bar
                        dataKey="level"
                        fill="var(--color-prescription)"
                        radius={4}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    No stock data available
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  Total Patients: {prescriptionMetrics?.patientCount ?? 'N/A'}
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
