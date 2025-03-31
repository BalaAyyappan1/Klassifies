"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function User() {
  const [chartData, setChartData] = useState<
    Array<{ month: string; desktop: number }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/all-users?role=user&includeAds=true')
      if (!response.ok) throw new Error('Failed to fetch users')
      const users = await response.json()
    console.log(users)
      
      // Process the users data to count by month
      const usersByMonth = countUsersByMonth(users)
      setChartData(usersByMonth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Function to count users by their creation month
  const countUsersByMonth = (users: any[]) => {
    const monthNames = [
      "January", "February", "March", 
      "April", "May", "June", 
      "July", "August", "September",
      "October", "November", "December"
    ]
    
    // Initialize all months with 0 users
    const monthlyCounts = monthNames.map(month => ({
      month,
      desktop: 0
    }))
    
    // Count users per month
    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt)
        const monthIndex = date.getMonth()
        monthlyCounts[monthIndex].desktop += 1
      }
    })
    
    return monthlyCounts
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Signups by Month</CardTitle>
        <CardDescription>Monthly user registration statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Total Users: {chartData.reduce((sum, month) => sum + month.desktop, 0)}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing user signups by month
        </div>
      </CardFooter>
    </Card>
  )
}