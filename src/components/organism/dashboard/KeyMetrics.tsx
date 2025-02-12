import { Metrics as MetricsType } from "@/lib/server";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/ui/card";
import { ErrorUi } from "../../atoms/ui/error";
import { DollarSign, Users, Play, Activity } from "lucide-react";
import { useMemo } from "react";

// Configuration for each metric card, defined outside component to avoid recreation on each render
// Each metric has a title, key to access data, value formatter, and icon
const METRICS_CONFIG = [
  {
    title: "Total Revenue",
    valueKey: "revenue",
    formatValue: (value: number) => `$${value.toFixed(2)}`, // Format revenue with $ and 2 decimal places
    icon: DollarSign,
  },
  {
    title: "Total Users",
    valueKey: "totalUsers",
    formatValue: (value: number) => value,
    icon: Users,
  },
  {
    title: "Total Streams",
    valueKey: "totalStreams",
    formatValue: (value: number) => value,
    icon: Play,
  },
  {
    title: "Active Users",
    valueKey: "activeUsers",
    formatValue: (value: number) => value,
    icon: Activity,
  },
] as const; // Use const assertion to ensure type safety

// Reusable card component for displaying individual metrics
// Memoized to prevent unnecessary re-renders when parent updates
const MetricCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: typeof DollarSign;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {/* Show loading skeleton when data is being fetched */}
      {isLoading ? (
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <div className="text-2xl font-bold text-left">{value}</div>
      )}
    </CardContent>
  </Card>
);

const KeyMetrics = () => {
  // Fetch metrics data using SWR for automatic caching and revalidation
  const {
    data: metrics,
    isLoading,
    error,
  } = useSWR<MetricsType>("/api/metrics", fetcher);

  // Transform raw metrics data into display format
  // Memoized to prevent recalculation unless metrics change
  const metricsData = useMemo(
    () =>
      METRICS_CONFIG.map(({ title, valueKey, formatValue, icon }) => ({
        title,
        value: metrics ? formatValue(metrics[valueKey]) : "",
        icon,
      })),
    [metrics]
  );

  if (error) return <ErrorUi message={error.message} />;

  // Render grid of metric cards
  // Responsive layout: 2 columns on medium screens, 4 columns on large screens
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricsData.map((item) => (
        <MetricCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default KeyMetrics;
