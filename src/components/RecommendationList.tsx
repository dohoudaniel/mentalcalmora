
import { useMood, Recommendation } from "@/contexts/MoodContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Heart, Calendar, Book, User } from "lucide-react";

const RecommendationItem = ({ recommendation }: { recommendation: Recommendation }) => {
  const getIcon = () => {
    switch (recommendation.type) {
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
    <div className="flex space-x-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow calmora-card-hover">
      <div className="mt-1">{getIcon()}</div>
      <div>
        <h4 className="font-medium text-slate-text">{recommendation.title}</h4>
        <p className="text-slate-text/80 text-sm">{recommendation.description}</p>
      </div>
    </div>
  );
};

const RecommendationList = () => {
  const { recommendations } = useMood();

  if (recommendations.length === 0) {
    return (
      <Card className="w-full shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-slate-text">Recommendations</CardTitle>
          <CardDescription>
            No recommendations available yet. Add your first mood entry to get started!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-text">Your Recommendations</CardTitle>
        <CardDescription>
          Based on your recent mood patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <RecommendationItem 
              key={recommendation.id} 
              recommendation={recommendation} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationList;
