import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecentStreams as RecentStreamsType } from "@/lib/server";
import { fetcher, fetcherWithParams } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { ErrorUi } from "../ui/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const RecentSongs = () => {
  // State to manage all filter parameters for the streams data
  const [filters, setFilters] = useState({
    artist: "",
    songName: "",
    sortBy: "dateStreamed",
    sortOrder: "desc",
    limit: 10,
    offset: 0,
    search: "",
  });

  // Fetch streams data with current filters
  // Using SWR for data fetching with caching and revalidation
  const { data: recentStreams, error } = useSWR<RecentStreamsType[]>(
    ["/api/recent-streams", JSON.stringify(filters)],
    () => fetcherWithParams("/api/recent-streams", filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  // Fetch list of all artists for the filter dropdown
  const { data: artists } = useSWR<string[]>("/api/artists", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  // Callback handlers for filter changes
  // Each handler resets the offset to 0 to start from the beginning with new filters
  const handleSortChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
      offset: 0,
    }));
  }, []);

  const handleSortOrderChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: value as "asc" | "desc", 
      offset: 0,
    }));
  }, []);

  const handleArtistChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      artist: value,
      offset: 0,
    }));
  }, []);

  // Increase limit to load more items
  const handleLoadMore = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      limit: prev.limit + 10,
    }));
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      offset: 0
    }));
  }, []);

  // Reset all filters to default values
  const handleClearFilters = useCallback(() => {
    setFilters({
      sortBy: "dateStreamed",
      sortOrder: "desc",
      artist: "",
      songName: "",
      limit: 10,
      offset: 0,
      search: "",
    });
  }, []);

  // Memoized artist select items to prevent unnecessary re-renders
  const artistSelectItems = useMemo(() => {
    return artists?.map((artist) => (
      <SelectItem key={artist} value={artist}>
        {artist}
      </SelectItem>
    ));
  }, [artists]);

  // Memoized table rows with formatted date
  const tableRows = useMemo(() => {
    return recentStreams?.map((stream, index) => (
      <TableRow key={index}>
        <TableCell>{stream.songName}</TableCell>
        <TableCell>{stream.artist}</TableCell>
        <TableCell>
          {new Date(stream.dateStreamed).toLocaleDateString()}
        </TableCell>
        <TableCell>{stream.streamCount}</TableCell>
      </TableRow>
    ));
  }, [recentStreams]);

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

          <Select onValueChange={handleSortChange} value={filters.sortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateStreamed">Date Streamed</SelectItem>
              <SelectItem value="streamCount">Stream Count</SelectItem>
              <SelectItem value="artist">Artist</SelectItem>
              <SelectItem value="songName">Song Name</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleSortOrderChange} value={filters.sortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleArtistChange} value={filters.artist}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Artist" />
            </SelectTrigger>
            <SelectContent>
              {artistSelectItems}
            </SelectContent>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Song Name</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Date Streamed</TableHead>
            <TableHead>Stream Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRows}
        </TableBody>
      </Table>

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
