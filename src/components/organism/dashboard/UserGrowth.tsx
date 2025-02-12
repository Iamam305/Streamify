"use client";

import { UserGrowth as UserGrowthType } from "@/lib/server";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { ErrorUi } from "../../atoms/ui/error";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/atoms/ui/chart";
import { Skeleton } from "../../atoms/ui/skeleton";
import { useMemo } from "react";

const UserGrowth = () => {
  // Fetch user growth data using SWR
  // Disable revalidation on focus/reconnect to prevent unnecessary API calls
  const {
    data: userGrowth,
    isLoading,
    error,
  } = useSWR<UserGrowthType[]>("/api/user-growth", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Transform raw data into chart-compatible format
  // Extract month, total users and active users for each data point
  const chartData = useMemo(
    () =>
      userGrowth?.map((item) => ({
        month: item.month,
        totalUsers: item.totalUsers,
        activeUsers: item.activeUsers,
      })) || [],
    [userGrowth]
  );

  // Define chart configuration with colors and labels
  // Uses CSS variables for consistent theming across the app
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      totalUsers: {
        label: "Total Users",
        color: "hsl(var(--chart-1))",
      },
      activeUsers: {
        label: "Active Users",
        color: "hsl(var(--chart-2))",
      },
    }),
    []
  );

  // Handle error and loading states
  if (error) return <ErrorUi message={error.message} />;
  if (isLoading) return <Skeleton className="w-full h-[300px]" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>
          Showing total and active users over the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chart container with configuration for styling and tooltips */}
        <ChartContainer config={chartConfig}>
          {/* Area chart with accessibility support */}
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            {/* Horizontal grid lines for better readability */}
            <CartesianGrid vertical={false} />
            {/* X-axis showing abbreviated month names */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            {/* Custom tooltip that shows data point values */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {/* Stacked area for total users with custom styling */}
            <Area
              dataKey="totalUsers"
              type="natural"
              fill={chartConfig.totalUsers.color}
              fillOpacity={0.4}
              stroke={chartConfig.totalUsers.color}
              stackId="a"
            />
            {/* Stacked area for active users with custom styling */}
            <Area
              dataKey="activeUsers"
              type="natural"
              fill={chartConfig.activeUsers.color}
              fillOpacity={0.4}
              stroke={chartConfig.activeUsers.color}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default UserGrowth;
