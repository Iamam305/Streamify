import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/ui/select";
import { RecentStreams as RecentStreamsType } from "@/lib/server";
import { fetcher, fetcherWithParams } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "../../atoms/ui/button";
import { ErrorUi } from "../../atoms/ui/error";
import { Input } from "../../atoms/ui/input";
import TableComponent from "../../molecules/tableComponent";
import { RangeDatePicker } from "@/components/atoms/ui/datePicker";

type SortBy = "songName" | "artist" | "streamCount" | "dateStreamed";

type SortFilter = {
  sortBy: SortBy;
  sortOrder: "desc" | "asc";
};

type Filters = {
  artist: string;
  songName: string;
  limit: number;
  offset: number;
  search: string;
  startDate: Date | null;
  endDate: Date | null;
  minStreamCount: string;
  maxStreamCount: string;
};

const INITIAL_FILTERS: Filters = {
  artist: "",
  songName: "",
  limit: 10,
  offset: 0,
  search: "",
  startDate: null,
  endDate: null,
  minStreamCount: "",
  maxStreamCount: "",
};

const RecentSongs = () => {
  const [sortFilter, setSortFilter] = useState<SortFilter>({
    sortBy: "dateStreamed",
    sortOrder: "desc",
  });

  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [allLoadedStreams, setAllLoadedStreams] = useState<RecentStreamsType[]>([]);

  const {
    data: recentStreams,
    error,
    mutate: refetchRecentStreams,
  } = useSWR<RecentStreamsType[]>(
    ["/api/recent-streams", JSON.stringify(filters)],
    () =>
      fetcherWithParams("/api/recent-streams", {
        ...filters,
        ...sortFilter,
        startDate: filters.startDate && filters.endDate ? filters.startDate.toISOString() : null,
        endDate: filters.startDate && filters.endDate ? filters.endDate.toISOString() : null,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { data: artists } = useSWR<string[]>("/api/artists", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (!recentStreams) return;

    if (filters.offset === 0) {
      setAllLoadedStreams(recentStreams);
    } else {
      setAllLoadedStreams((prev) => [...prev, ...recentStreams]);
    }
  }, [recentStreams, filters.offset]);

  useEffect(() => {
    if (filters.offset === 0) {
      refetchRecentStreams();
    }
  }, [filters, sortFilter, refetchRecentStreams]);

  const updateFilters = useCallback((updates: Partial<Filters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      offset: 0,
    }));
  }, []);

  const handleLoadMore = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  }, []);

  const handleSortFilterChange = useCallback((sortBy: SortBy) => {
    setSortFilter(prev => ({
      sortBy,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  }, []);

  const artistSelectItems = useMemo(() => {
    return artists?.map(artist => (
      <SelectItem key={artist} value={artist}>
        {artist}
      </SelectItem>
    ));
  }, [artists]);

  const headers = useMemo(() => [
    {
      head: "Song Name",
      icon: sortFilter.sortBy === "songName" 
        ? (sortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown)
        : ChevronDown,
      onClick: () => handleSortFilterChange("songName"),
    },
    {
      head: "Artist",
      icon: sortFilter.sortBy === "artist"
        ? (sortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown)
        : ChevronDown,
      onClick: () => handleSortFilterChange("artist"),
    },
    {
      head: "Date Streamed",
      icon: sortFilter.sortBy === "dateStreamed"
        ? (sortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown)
        : ChevronDown,
      onClick: () => handleSortFilterChange("dateStreamed"),
    },
    {
      head: "Stream Count",
      icon: sortFilter.sortBy === "streamCount"
        ? (sortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown)
        : ChevronDown,
      onClick: () => handleSortFilterChange("streamCount"),
    },
  ], [sortFilter, handleSortFilterChange]);

  const tableData = useMemo(() => {
    return allLoadedStreams?.map(stream => [
      stream.songName,
      stream.artist,
      new Date(stream.dateStreamed).toLocaleDateString(),
      stream.streamCount.toString(),
    ]) || [];
  }, [allLoadedStreams]);

  if (error) return <ErrorUi message={error.message} />;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-between items-end w-full">
        <div className="flex gap-4 items-end">
          <Input
            placeholder="Search"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />

          <Select 
            onValueChange={(value) => updateFilters({ artist: value })} 
            value={filters.artist}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Artist" />
            </SelectTrigger>
            <SelectContent>{artistSelectItems}</SelectContent>
          </Select>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Stream Count Range
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minStreamCount}
                onChange={(e) => updateFilters({ minStreamCount: e.target.value })}
                className="w-24"
                min={0}
                max={500}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxStreamCount}
                onChange={(e) => updateFilters({ maxStreamCount: e.target.value })}
                className="w-24"
                min={0}
                max={500}
              />
            </div>
          </div>

          <RangeDatePicker
            startDate={filters.startDate ?? undefined}
            endDate={filters.endDate ?? undefined}
            setStartDate={(date) => updateFilters({ startDate: date ?? null })}
            setEndDate={(date) => updateFilters({ endDate: date ?? null })}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setFilters(INITIAL_FILTERS)}
          className="w-[180px]"
        >
          Clear Filters
        </Button>
      </div>

      <TableComponent headers={headers} data={tableData} />

      {allLoadedStreams.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleLoadMore} variant="outline">
            Load More
        </Button>
      </div>
      )}
    </div>
  );
};

export default RecentSongs;
