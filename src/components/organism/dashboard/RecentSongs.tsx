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

type currentSortFilterType = {
  sortBy: "songName" | "artist" | "streamCount" | "dateStreamed";
  sortOrder: "desc" | "asc";
};

const RecentSongs = () => {
  // State to manage all filter parameters for the streams data
  const [currentSortFilter, setCurrentSortFilter] =
    useState<currentSortFilterType>({
      sortBy: "dateStreamed",
      sortOrder: "desc",
    });

  const [filters, setFilters] = useState({
    artist: "",
    songName: "",
    limit: 10,
    offset: 0,
    search: "",
  });

  // Keep track of all loaded streams
  const [allLoadedStreams, setAllLoadedStreams] = useState<RecentStreamsType[]>([]);

  // Fetch streams data with current filters
  // Using SWR for data fetching with caching and revalidation
  const {
    data: recentStreams,
    error,
    mutate: refetchRecentStreams,
  } = useSWR<RecentStreamsType[]>(
    ["/api/recent-streams", JSON.stringify(filters)],
    () =>
      fetcherWithParams("/api/recent-streams", {
        ...filters,
        ...currentSortFilter,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (recentStreams) {
      if (filters.offset === 0) {
        // Reset loaded streams if filters change
        setAllLoadedStreams(recentStreams);
      } else {
        // Append new streams to existing ones
        setAllLoadedStreams(prev => [...prev, ...recentStreams]);
      }
    }
  }, [recentStreams, filters.offset]);

  useEffect(() => {
    if (filters.offset === 0) {
      refetchRecentStreams();
    }
  }, [filters, currentSortFilter, refetchRecentStreams]);

  // Fetch list of all artists for the filter dropdown
  const { data: artists } = useSWR<string[]>("/api/artists", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const handleArtistChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      artist: value,
      offset: 0,
    }));
  }, []);

  // Increase limit and offset to load more items
  const handleLoadMore = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + 10,
    }));
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      offset: 0,
    }));
  }, []);

  // Reset all filters to default values
  const handleClearFilters = useCallback(() => {
    setFilters({
      artist: "",
      songName: "",
      limit: 10,
      offset: 0,
      search: "",
    });
  }, []);

  const handleSortFilterChange = (
    value: "songName" | "artist" | "streamCount" | "dateStreamed"
  ) => {
    console.log(value);

    setCurrentSortFilter((prev) => ({
      sortBy: value,
      sortOrder: prev.sortOrder == "asc" ? "desc" : "asc",
    }));
  };

  // Memoized artist select items to prevent unnecessary re-renders
  const artistSelectItems = useMemo(() => {
    return artists?.map((artist) => (
      <SelectItem key={artist} value={artist}>
        {artist}
      </SelectItem>
    ));
  }, [artists]);

  const headers = [
    {
      head: "Song Name",
      icon: currentSortFilter.sortBy === "songName" ? 
        (currentSortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown) : ChevronDown,
      onClick: () => handleSortFilterChange("songName")
    },
    {
      head: "Artist",
      icon: currentSortFilter.sortBy === "artist" ? 
        (currentSortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown) : ChevronDown,
      onClick: () => handleSortFilterChange("artist")
    },
    {
      head: "Date Streamed",
      icon: currentSortFilter.sortBy === "dateStreamed" ? 
        (currentSortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown) : ChevronDown,
      onClick: () => handleSortFilterChange("dateStreamed")
    },
    {
      head: "Stream Count",
      icon: currentSortFilter.sortBy === "streamCount" ? 
        (currentSortFilter.sortOrder === "asc" ? ChevronUp : ChevronDown) : ChevronDown,
      onClick: () => handleSortFilterChange("streamCount")
    }
  ];

  const tableData = useMemo(() => {
    return allLoadedStreams?.map(stream => [
      stream.songName,
      stream.artist,
      new Date(stream.dateStreamed).toLocaleDateString(),
      stream.streamCount.toString()
    ]) || [];
  }, [allLoadedStreams]);

  if (error) return <ErrorUi message={error.message} />;

  return (
    <div className="space-y-4">
      {/* Filter controls section */}
      <div className="flex gap-4 justify-between w-full">
        <div className="flex gap-4">
          <Input
            placeholder="Search"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <Select onValueChange={handleArtistChange} value={filters.artist}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Artist" />
            </SelectTrigger>
            <SelectContent>{artistSelectItems}</SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="w-[180px]"
        >
          Clear Filters
        </Button>
      </div>

      {/* Data table section */}
      <TableComponent headers={headers} data={tableData} />

      {/* Load more button - only shown if there are potentially more items to load */}
      {recentStreams && recentStreams.length >= filters.limit && (
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
