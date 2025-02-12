// src/mirage/server.ts
import { createServer, Model, Factory, Server } from "miragejs";
import { faker } from "@faker-js/faker";

// Define TypeScript interfaces for our models.
export interface User {
  username: string;
  createdAt: string;
}

export interface Stream {
  songName: string;
  artist: string;
  dateStreamed: string;
  streamCount: number;
  userId: number;
}

export interface Revenue {
  source: string;
  amount: string;
}

export interface Metrics {
  totalUsers: number;
  activeUsers: number;
  totalStreams: number;
  revenue: number;
  topArtist: string;
}

export interface UserGrowth {
  month: string;
  totalUsers: number;
  activeUsers: number;
}

export interface RevenueDistribution {
  source: string;
  amount: number;
}

export interface TopStreamedSongs {
  songName: string;
  count: number;
}

export interface RecentStreams {
  songName: string;
  artist: string;
  dateStreamed: string;
  streamCount: number;
}

export function makeServer({ environment = "development" } = {}): Server {
  const server = createServer({

    environment,

    // Define models with TypeScript types for type safety
    models: {
      user: Model.extend<Partial<User>>({}),
      stream: Model.extend<Partial<Stream>>({}),
      revenue: Model.extend<Partial<Revenue>>({}),
    },

    // Factories generate fake data for testing and development
    factories: {
      user: Factory.extend<Partial<User>>({
        username() {
          return faker.person.firstName() + faker.number.int({ min: 1, max: 999 });
        },
        createdAt() {
          return faker.date.past({ years: 1 }).toISOString();
        },
      }),
      stream: Factory.extend<Partial<Stream>>({
        songName() {
          return faker.music.songName();
        },
        // Use a fixed list of popular artists for more realistic data
        artist() {
          return faker.helpers.arrayElement([
            "Taylor Swift",
            "Ed Sheeran",
            "Drake",
            "The Weeknd",
            "Ariana Grande",
            "Post Malone",
            "Billie Eilish",
            "Bad Bunny"
          ]);
        },
        dateStreamed() {
          return faker.date.recent({ days: 60 }).toISOString();
        },
        streamCount() {
          return faker.number.int({ min: 100, max: 500 });
        },
        userId() {
          return faker.number.int({ min: 1, max: 500 });
        },
      }),
      revenue: Factory.extend<Partial<Revenue>>({
        source() {
          return faker.helpers.arrayElement(["Subscriptions", "Ads", "Merchandise", "Licensing"]);
        },
        amount() {
          return faker.finance.amount({ min: 100, max: 10000, dec: 2 });
        },
      }),

    },

    // Seed the database with initial data
    seeds(server) {
      server.createList("user", 500);
      server.createList("stream", 1000);
      // Create fixed revenue entries for consistent reporting
      server.create("revenue", { source: "Subscriptions", amount: "75000" });

      server.create("revenue", { source: "Ads", amount: "45000" });
      server.create("revenue", { source: "Merchandise", amount: "25000" });
      server.create("revenue", { source: "Licensing", amount: "35000" });
    },

    // Define API endpoints
    routes() {
      this.namespace = "api";

      // Get unique, sorted list of artists
      this.get("/artists", (schema) => {
        const streams = schema.all("stream").models as Array<Stream & { id: string }>;
        const uniqueArtists = [...new Set(streams.map(stream => stream.artist))];
        return uniqueArtists.sort();
      });

      // Calculate and return key metrics for dashboard
      this.get("/metrics", (schema) => {
        const totalUsers = schema.all("user").length;
        const today = new Date();
        const streams = schema.all("stream").models as Array<Stream & { id: string }>;

        // Count users who have streamed in the last 30 days as active
        const activeUserIds = new Set<number>(
          streams
            .filter((stream) => {
              const date = new Date(stream.dateStreamed);
              const diffDays = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
              return diffDays <= 30;
            })
            .map((stream) => stream.userId)
        );
        const activeUsers = activeUserIds.size;
        const totalStreams = streams.reduce((acc, stream) => acc + stream.streamCount, 0);

        // Calculate total revenue across all sources
        const revenues = schema.all("revenue").models as Array<Revenue & { id: string }>;
        const revenue = revenues.reduce((acc, rev) => acc + Number(rev.amount), 0);

        // Find the artist with the most streams in the last 30 days
        const artistCounts: { [artist: string]: number } = {};
        streams.forEach((stream) => {
          const date = new Date(stream.dateStreamed);
          const diffDays = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays <= 30) {
            artistCounts[stream.artist] = (artistCounts[stream.artist] || 0) + stream.streamCount;
          }
        });
        const topArtist = Object.keys(artistCounts).reduce(
          (prev, curr) => artistCounts[prev] > artistCounts[curr] ? prev : curr,
          ""
        );

        return {
          totalUsers,
          activeUsers,
          totalStreams,
          revenue,
          topArtist,
        };
      });

      // Generate user growth data for the past 12 months
      this.get("/user-growth", (schema) => {
        const data: Array<{
          month: string;
          totalUsers: number;
          activeUsers: number;
        }> = [];
        const currentDate = new Date();
        const users = schema.all("user").models as Array<User & { id: string }>;
        const streams = schema.all("stream").models as Array<Stream & { id: string }>;

        // Calculate metrics for each of the last 12 months
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          
          // Count total users registered by this month
          const totalUsersForMonth = users.filter(
            (user) => new Date(user.createdAt) <= monthStart
          ).length;

          // Count users who streamed in this specific month
          const activeUserIds = new Set<number>(
            streams
              .filter((stream) => {
                const date = new Date(stream.dateStreamed);
                return (
                  date.getFullYear() === monthStart.getFullYear() &&
                  date.getMonth() === monthStart.getMonth()
                );
              })
              .map((stream) => stream.userId)
          );
          const activeUsersForMonth = activeUserIds.size;

          data.push({
            month: monthStart.toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
            totalUsers: totalUsersForMonth,
            activeUsers: activeUsersForMonth,
          });
        }
        return data;
      });

      // Calculate revenue distribution for pie chart
      this.get("/revenue-distribution", (schema) => {
        const revenues = schema.all("revenue").models as Array<Revenue & { id: string }>;
        const distribution = revenues.reduce((acc: { [source: string]: number }, rev) => {
          acc[rev.source] = (acc[rev.source] || 0) + Number(rev.amount);
          return acc;
        }, {});
        return Object.keys(distribution).map((source) => ({
          source,
          amount: distribution[source],
        }));
      });

      // Get top 5 most streamed songs in the last 30 days
      this.get("/top-streamed-songs", (schema) => {
        const today = new Date();
        const streams = schema.all("stream").models as Array<Stream & { id: string }>;
        const songCounts: { [songName: string]: number } = {};

        // Aggregate stream counts for songs in the last 30 days
        streams.forEach((stream) => {
          const date = new Date(stream.dateStreamed);
          const diffDays = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays <= 30) {
            songCounts[stream.songName] = (songCounts[stream.songName] || 0) + stream.streamCount;
          }
        });

        // Sort and return top 5 songs
        const sortedSongs = Object.entries(songCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([songName, count]) => ({ songName, count }));

        return sortedSongs;
      });

      // Get recent streams with filtering, sorting, and pagination
      this.get("/recent-streams", (schema, request) => {
        let streams = schema.all("stream").models as Array<Stream & { id: string }>;
        
        // Extract query parameters
        const { 
          artist, 
          songName, 
          sortBy, 
          sortOrder, 
          limit, 
          offset, 
          search,
          startDate,
          endDate,
          minStreamCount,
          maxStreamCount
        } = request.queryParams;
        
        // Apply filters based on artist name
        if (artist) {
          streams = streams.filter(stream => 
            stream.artist.toLowerCase().includes((artist as string).toLowerCase())
          );
        }
        
        // Apply filters based on song name
        if (songName) {
          streams = streams.filter(stream => 
            stream.songName.toLowerCase().includes((songName as string).toLowerCase())
          );
        }

        // Apply general search across song name and artist
        if (search) {
          streams = streams.filter(stream => 
            stream.songName.toLowerCase().includes((search as string).toLowerCase()) ||
            stream.artist.toLowerCase().includes((search as string).toLowerCase())
          );
        }

        // Apply date range filters
        if (startDate) {
          const start = new Date(startDate as string);
          streams = streams.filter(stream => 
            new Date(stream.dateStreamed) >= start
          );
        }

        if (endDate) {
          const end = new Date(endDate as string);
          streams = streams.filter(stream => 
            new Date(stream.dateStreamed) <= end
          );
        }

        // Apply stream count filters
        if (minStreamCount) {
          const min = parseInt(minStreamCount as string);
          streams = streams.filter(stream => stream.streamCount >= min);
        }

        if (maxStreamCount) {
          const max = parseInt(maxStreamCount as string);
          streams = streams.filter(stream => stream.streamCount <= max);
        }

        // Apply sorting based on specified field and order
        if (sortBy) {
          streams.sort((a, b) => {
            const order = sortOrder === 'desc' ? -1 : 1;
            
            switch(sortBy) {
              case 'dateStreamed':
                return order * (new Date(b.dateStreamed).getTime() - new Date(a.dateStreamed).getTime());
              case 'streamCount':
                return order * (b.streamCount - a.streamCount);
              case 'artist':
                return order * a.artist.localeCompare(b.artist);
              case 'songName':
                return order * a.songName.localeCompare(b.songName);
              default:
                return 0;
            }
          });
        } else {
          // Default sort by most recent date
          streams.sort((a, b) => 
            new Date(b.dateStreamed).getTime() - new Date(a.dateStreamed).getTime()
          );
        }

        // Apply pagination
        const pageLimit = limit ? parseInt(limit as string) : 10;
        const pageOffset = offset ? parseInt(offset as string) : 0;
        
        streams = streams.slice(pageOffset, pageOffset + pageLimit);

        return streams;
      });
    },
  });

  return server;
}
