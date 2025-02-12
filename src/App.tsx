import "./App.css";
import KeyMetrics from "./components/organism/dashboard/KeyMetrics";
import RecentSongs from "./components/organism/dashboard/RecentSongs";
import RevenueDistribution from "./components/organism/dashboard/RevenueDistribution";
import TopStreamedSongs from "./components/organism/dashboard/TopStreamedSongs";
import UserGrowth from "./components/organism/dashboard/UserGrowth";

function App() {
  return (
    <main className="flex-1 space-y-8 p-8 pt-6 container mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <KeyMetrics />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserGrowth />
        <RevenueDistribution />
        <TopStreamedSongs />
      </div>
      <div className="">
        <RecentSongs />
      </div>
    </main>
  );
}

export default App;
