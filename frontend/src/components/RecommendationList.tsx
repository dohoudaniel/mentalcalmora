import { useMemo } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Heart, Calendar, Book, User } from 'lucide-react';
import type { Recommendation } from '@/types';

const RecommendationItem = ({ recommendation }: { recommendation: Recommendation }) => {
  const icon = useMemo(() => {
    switch (recommendation.type) {
      case 'exercise': return <Heart className="h-5 w-5 text-leaf-green" />;
      case 'mindfulness': return <Calendar className="h-5 w-5 text-sky-blue" />;
      case 'social': return <User className="h-5 w-5 text-lavender" />;
      default: return <Book className="h-5 w-5 text-peach-glow" />;
    }
  }, [recommendation.type]);

  return (
    <div className="flex space-x-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow calmora-card-hover">
      <div className="mt-1">{icon}</div>
      <div>
        <h4 className="font-medium text-slate-text">{recommendation.title}</h4>
        <p className="text-slate-text/80 text-sm">{recommendation.description}</p>
      </div>
    </div>
  );
};

const RecommendationList = () => {
  const { recommendations, loading } = useMood();

  if (loading) {
    return (
      <Card className="w-full shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-slate-text">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leaf-green" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="w-full shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-slate-text">Recommendations</CardTitle>
          <CardDescription>No recommendations available yet. Add your first mood entry to get started!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-text">Your Recommendations</CardTitle>
        <CardDescription>Based on your recent mood patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <RecommendationItem key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationList;
