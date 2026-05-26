import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { MoodEntry, Recommendation } from '@/types';
import { fetchMoodEntry, fetchRecommendations } from '@/services/moodService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, Heart, Calendar, Book, User, Lightbulb } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'POSITIVE': return 'text-leaf-green';
    case 'NEGATIVE': return 'text-peach-glow';
    default: return 'text-sky-blue';
  }
};

const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment) {
    case 'POSITIVE': return '⬆️';
    case 'NEGATIVE': return '⬇️';
    default: return '➡️';
  }
};

const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'exercise': return <Heart className="h-5 w-5 text-leaf-green" />;
    case 'mindfulness': return <Calendar className="h-5 w-5 text-sky-blue" />;
    case 'social': return <User className="h-5 w-5 text-lavender" />;
    default: return <Book className="h-5 w-5 text-peach-glow" />;
  }
};

const Results = () => {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntry = useCallback(async () => {
    if (!entryId) {
      navigate('/dashboard');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMoodEntry(entryId);
      setEntry(data);
      // Fetch recommendations based on entry sentiment
      const recs = await fetchRecommendations(data.sentiment);
      setRecommendations(recs);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load mood entry',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [entryId, navigate]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading results...</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')}>
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

  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Entry not found</CardTitle>
              <CardDescription>The mood entry you're looking for doesn't exist or you don't have access to it.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')}>
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

  const formattedDate = format(new Date(entry.timestamp), "MMMM d, yyyy 'at' h:mm a");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist dark:bg-slate-text/90">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-slate-text dark:text-mint-mist mb-2">Your Mood Results</h1>
            <p className="text-slate-text/80 dark:text-mint-mist/80">Analysis and personalized recommendations based on your entry</p>
          </div>

          <Card className="bg-white dark:bg-slate-text shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-slate-text dark:text-mint-mist">
                <span className="text-3xl" aria-hidden="true">{getMoodEmoji(entry.mood)}</span>
                {entry.mood}
              </CardTitle>
              <CardDescription className="dark:text-mint-mist/80">{formattedDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-mint-mist dark:bg-slate-text/60">
                <p className="text-slate-text dark:text-mint-mist whitespace-pre-wrap">{entry.text}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-text/80 border">
                  <h3 className="font-medium text-slate-text dark:text-mint-mist mb-1">Sentiment Analysis</h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getSentimentColor(entry.sentiment)}`}>{entry.sentiment}</span>
                    <span className="text-sm">{getSentimentEmoji(entry.sentiment)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-slate-text/80 border">
                  <h3 className="font-medium text-slate-text dark:text-mint-mist mb-1">Sentiment Score</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold dark:text-mint-mist">{(entry.score * 100).toFixed(0)}%</span>
                    <div
                      className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5"
                      role="progressbar"
                      aria-valuenow={Math.round(entry.score * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-2.5 rounded-full bg-leaf-green" style={{ width: `${entry.score * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {entry.insights && (
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-leaf-green/5 to-sky-blue/5 dark:from-leaf-green/10 dark:to-sky-blue/10 border border-leaf-green/20">
                  <h3 className="font-medium text-slate-text dark:text-mint-mist mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-leaf-green" />
                    Personalized Insights
                  </h3>
                  <p className="text-slate-text/90 dark:text-mint-mist/90 whitespace-pre-wrap">{entry.insights}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-text shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-text dark:text-mint-mist">Your Personalized Recommendations</CardTitle>
              <CardDescription className="dark:text-mint-mist/80">Based on your mood and overall mental wellness patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg border dark:border-slate-text/20 calmora-card-hover dark:bg-slate-text/80">
                    <div className="flex space-x-4">
                      <div className="mt-1">{getRecommendationIcon(rec.type)}</div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-text dark:text-mint-mist">{rec.title}</h3>
                        <p className="text-slate-text/80 dark:text-mint-mist/80 mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/dashboard">
                  <Button className="bg-leaf-green hover:bg-leaf-green/90">Return to Dashboard</Button>
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
