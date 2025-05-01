
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
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Column */}
            <div className="w-full lg:w-1/3 space-y-8">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-slate-text mb-1">
                  Welcome back , {currentUser?.firstName}!
                </h1>
                <p className="text-slate-text/80">
                  How are you feeling today?
                </p>
              </div>
              
              <MoodForm />
              
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-slate-text">Recent Entries</CardTitle>
                    <Link to="/history">
                      <Button variant="ghost" size="sm" className="text-leaf-green flex items-center gap-1">
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
                    <p className="text-slate-text/80 text-center py-4">
                      No mood entries yet. Add your first mood above!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="w-full lg:w-2/3 space-y-8 mt-8 lg:mt-0">
              <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
                <MoodChart />
              </div>
              
              <RecommendationList />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
