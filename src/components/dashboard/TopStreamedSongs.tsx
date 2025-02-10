"use client";

import { TopStreamedSongs as TopStreamedSongsType } from "@/lib/server";
import { fetcher } from "@/lib/utils";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import useSWR from "swr";
import { ErrorUi } from "../ui/error";
import { Skeleton } from "../ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const TopStreamedSongs = () => {
  // Fetch top streamed songs data using SWR
  // Disable revalidation on focus/reconnect to prevent unnecessary API calls
  const {
    data: topStreamedSongs,
    isLoading,
    error,
  } = useSWR<TopStreamedSongsType[]>("/api/top-streamed-songs", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Transform raw data into chart-compatible format
  // Assign different colors to each song using CSS variables
  const chartData = useMemo(() => {
    if (!topStreamedSongs) return [];
    return topStreamedSongs.map((song, index) => ({
      song: song.songName,
      streams: song.count,
      fill: `hsl(var(--chart-${index + 1}))`, // Use CSS variables for consistent theming
    }));
  }, [topStreamedSongs]);

  // Generate configuration object for chart customization
  // Creates a mapping of song names to their display labels and colors
  const chartConfig = useMemo(() => {
    if (!topStreamedSongs) return {};

    const config: ChartConfig = {
      streams: {
        label: "Streams",
      },
    };

    // Add configuration for each song with unique colors
    topStreamedSongs.forEach((song, index) => {
      config[song.songName] = {
        label: song.songName,
        color: `hsl(var(--chart-${index + 1}))`,
      };
    });

    return config;
  }, [topStreamedSongs]);

  // Handle error and loading states
  if (error) return <ErrorUi message={error.message} />;
  if (isLoading) return <Skeleton className="w-full h-[300px]" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Streamed Songs</CardTitle>
        <CardDescription>Most played songs this month</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chart container with configuration for styling and tooltips */}
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="song"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}

            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent   />}
            />
            <Bar dataKey="streams" fill="var(--color-desktop)" radius={8}>
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
    </Card>
  );
};

export default TopStreamedSongs;
