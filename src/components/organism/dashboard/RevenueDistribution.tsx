"use client";

import { RevenueDistribution as RevenueDistributionType } from "@/lib/server";
import { fetcher } from "@/lib/utils";
import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import useSWR from "swr";
import { ErrorUi } from "../../atoms/ui/error";
import { Skeleton } from "../../atoms/ui/skeleton";

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

const RevenueDistribution = () => {
  // Fetch revenue distribution data using SWR
  // Disable revalidation on focus/reconnect to prevent unnecessary API calls
  const {
    data: revenueDistribution,
    isLoading,
    error,
  } = useSWR<RevenueDistributionType[]>("/api/revenue-distribution", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Transform raw data into chart-compatible format
  // Assign different colors to each revenue source using CSS variables
  const chartData = useMemo(() => {
    if (!revenueDistribution) return [];
    return revenueDistribution.map((item, index) => ({
      source: item.source,
      amount: item.amount,
      fill: `hsl(var(--chart-${index + 1}))`,
    }));
  }, [revenueDistribution]);

  // Generate configuration object for chart customization
  // Creates a mapping of revenue sources to their display labels and colors
  const chartConfig = useMemo(() => {
    if (!revenueDistribution) return {};

    const config: ChartConfig = {
      amount: {
        label: "Revenue",
      },
    };

    revenueDistribution.forEach((item, index) => {
      config[item.source] = {
        label: item.source,
        color: `hsl(var(--chart-${index + 1}))`,
      };
    });

    return config;
  }, [revenueDistribution]);

  // Handle error and loading states
  if (error) return <ErrorUi message={error.message} />;
  if (isLoading) return <Skeleton className="w-full h-[300px]" />;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Revenue Distribution</CardTitle>
        <CardDescription>Revenue by Source</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {/* Chart container with responsive sizing */}
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            {/* Custom tooltip that hides labels for cleaner UI */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="amount" nameKey="source" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueDistribution;
