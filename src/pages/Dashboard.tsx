
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMood } from "@/contexts/MoodContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MoodForm from "@/components/MoodForm";
import RecommendationList from "@/components/RecommendationList";
import MoodHistoryItem from "@/components/MoodHistoryItem";
import MoodChart from "@/components/MoodChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { History } from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { entries } = useMood();
  
  // Display only the last 4 entries
  const recentEntries = entries.slice(0, 4);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist dark:bg-slate-text/90">
        <div className="container mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-slate-text p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-slate-text dark:text-mint-mist mb-2">
              Welcome back!
            </h1>
            <p className="text-slate-text/80 dark:text-mint-mist/80 text-lg">
              How are you feeling today?
            </p>
          </div>

          {/* Mood Form Section */}
          <div className="w-full max-w-2xl mx-auto">
            <MoodForm />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Recent Entries */}
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-text shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-slate-text dark:text-mint-mist">Recent Entries</CardTitle>
                    <Link to="/history">
                      <Button variant="ghost" size="sm" className="text-leaf-green flex items-center gap-2">
                        <History className="h-4 w-4" />
                        View all
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentEntries.length > 0 ? (
                    <div className="space-y-4">
                      {recentEntries.map(entry => (
                        <MoodHistoryItem key={entry.id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-text/80 dark:text-mint-mist/80 text-lg mb-4">
                        No mood entries yet.
                      </p>
                      <p className="text-slate-text/60 dark:text-mint-mist/60">
                        Add your first mood above to start tracking your emotional journey!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Chart */}
            <div className="space-y-6">
              <MoodChart />
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="w-full">
            <RecommendationList />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
