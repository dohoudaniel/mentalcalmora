
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMood } from "@/contexts/MoodContext";
import { useProfile } from "@/hooks/useProfile";
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
  const { profile } = useProfile();
  
  // Display only the last 4 entries
  const recentEntries = entries.slice(0, 4);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist dark:bg-slate-text/90">
        <div className="container mx-auto space-y-8">
          {/* Top Row: Welcome Section and Mood Trends */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-slate-text p-6 rounded-lg shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-text dark:text-mint-mist mb-2">
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
              </h1>
              <div className="space-y-1 text-slate-text/80 dark:text-mint-mist/80">
                <p className="text-sm sm:text-base">
                  You have recorded <span className="font-semibold text-leaf-green">{entries.length}</span> mood {entries.length === 1 ? 'entry' : 'entries'}
                </p>
                <p className="text-sm sm:text-base">
                  Check out your personalized AI insights below
                </p>
              </div>
            </div>
            
            {/* Mood Trends */}
            <div>
              <MoodChart />
            </div>
          </div>

          {/* Mood Form Section - Centered and Full Width */}
          <div className="bg-white dark:bg-slate-text p-6 sm:p-8 rounded-lg shadow-md">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-text dark:text-mint-mist">
                How are you feeling today?
              </h2>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <MoodForm />
              </div>
            </div>
          </div>

          {/* Recent Entries Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-text dark:text-mint-mist">
                Recent Entries
              </h2>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-leaf-green flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <History className="h-4 w-4" />
                  View all
                </Button>
              </Link>
            </div>
            
            {recentEntries.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {recentEntries.map(entry => (
                  <div key={entry.id} className="bg-white dark:bg-slate-text p-4 rounded-lg shadow-md">
                    <MoodHistoryItem entry={entry} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-text rounded-lg shadow-md">
                <p className="text-slate-text/80 dark:text-mint-mist/80 text-lg mb-4">
                  No mood entries yet.
                </p>
                <p className="text-slate-text/60 dark:text-mint-mist/60">
                  Add your first mood above to start tracking your emotional journey!
                </p>
              </div>
            )}
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
