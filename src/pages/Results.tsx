
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMood, MoodEntry, Recommendation } from "@/contexts/MoodContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Heart, Calendar, Book, User } from "lucide-react";

const Results = () => {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { entries, recommendations } = useMood();
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  
  useEffect(() => {
    // Find the entry by ID
    if (entryId) {
      const id = parseInt(entryId);
      const foundEntry = entries.find(e => e.id === id) || entries[0]; // Fallback to latest entry
      setEntry(foundEntry || null);
      
      // If no entry found, redirect to dashboard
      if (!foundEntry) {
        navigate("/dashboard");
      }
    }
  }, [entryId, entries, navigate]);
  
  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading results...</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Function to get emoji based on mood
  const getMoodEmoji = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'energetic': return '⚡';
      case 'tired': return '😴';
      case 'anxious': return '😰';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '😐';
    }
  };
  
  // Function to get color based on sentiment
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-leaf-green';
      case 'NEGATIVE': return 'text-peach-glow';
      default: return 'text-sky-blue';
    }
  };
  
  // Function to get emoji based on sentiment
  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return '⬆️';
      case 'NEGATIVE': return '⬇️';
      default: return '➡️';
    }
  };

  const formattedDate = format(new Date(entry.timestamp), "MMMM d, yyyy 'at' h:mm a");
  
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return <Heart className="h-5 w-5 text-leaf-green" />;
      case 'mindfulness':
        return <Calendar className="h-5 w-5 text-sky-blue" />;
      case 'social':
        return <User className="h-5 w-5 text-lavender" />;
      default:
        return <Book className="h-5 w-5 text-peach-glow" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold text-slate-text mb-2">
              Your Mood Results
            </h1>
            <p className="text-slate-text/80">
              Analysis and personalized recommendations based on your entry
            </p>
          </div>
          
          <Card className="bg-white shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-slate-text">
                <span className="text-3xl" aria-hidden="true">
                  {getMoodEmoji(entry.mood || '')}
                </span>
                {entry.mood}
              </CardTitle>
              <CardDescription>
                {formattedDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-mint-mist">
                <p className="text-slate-text whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-white border">
                  <h3 className="font-medium text-slate-text mb-1">Sentiment Analysis</h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getSentimentColor(entry.sentiment)}`}>
                      {entry.sentiment}
                    </span>
                    <span className="text-sm">{getSentimentEmoji(entry.sentiment)}</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-white border">
                  <h3 className="font-medium text-slate-text mb-1">Sentiment Score</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {(entry.score * 100).toFixed(0)}%
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-leaf-green" 
                        style={{ width: `${entry.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-text">
                Your Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Based on your mood and overall mental wellness patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg border calmora-card-hover">
                    <div className="flex space-x-4">
                      <div className="mt-1">
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-text">{rec.title}</h3>
                        <p className="text-slate-text/80 mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/dashboard">
                  <Button className="bg-leaf-green hover:bg-leaf-green/90">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
