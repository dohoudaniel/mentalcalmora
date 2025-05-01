
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMood } from "@/contexts/MoodContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MoodHistoryItem from "@/components/MoodHistoryItem";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const History = () => {
  const { currentUser } = useAuth();
  const { entries } = useMood();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter entries based on selected filter and search query
  const filteredEntries = entries.filter(entry => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "positive" && entry.sentiment === "POSITIVE") ||
      (filter === "negative" && entry.sentiment === "NEGATIVE") ||
      (filter === "neutral" && entry.sentiment === "NEUTRAL");
      
    const matchesSearch = 
      searchQuery === "" || 
      entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.mood.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist">
        <div className="container mx-auto">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
            <h1 className="text-2xl font-bold text-slate-text mb-1">
              Mood History
            </h1>
            <p className="text-slate-text/80">
              View and analyze your previous mood entries
            </p>
          </div>
          
          <Card className="bg-white shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-slate-text">Filter Entries</CardTitle>
              <CardDescription>
                Find specific mood entries based on sentiment or content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entries</SelectItem>
                      <SelectItem value="positive">Positive Moods</SelectItem>
                      <SelectItem value="negative">Negative Moods</SelectItem>
                      <SelectItem value="neutral">Neutral Moods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-2/3 relative">
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-text/50" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-slate-text">Your Entries</CardTitle>
              <CardDescription>
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEntries.length > 0 ? (
                <div className="space-y-4">
                  {filteredEntries.map(entry => (
                    <MoodHistoryItem key={entry.id} entry={entry} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-slate-text/80 mb-4">
                    No entries match your current filters
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default History;
