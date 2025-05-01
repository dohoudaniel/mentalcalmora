
import { useState } from "react";
import { useMood } from "@/contexts/MoodContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const MoodForm = () => {
  const navigate = useNavigate();
  const { addMoodEntry, entries } = useMood();
  const [mood, setMood] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood) {
      toast({
        title: "Missing information",
        description: "Please select your current mood.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      addMoodEntry(mood, description);
      setMood("");
      setDescription("");
      
      // Navigate to results page
      const latestEntryId = entries.length > 0 ? entries[0].id + 1 : 1;
      navigate(`/results/${latestEntryId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving your mood entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-text">How are you feeling today?</CardTitle>
        <CardDescription>Track your mood and get personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-slate-text mb-1">
              Select your mood
            </label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger id="mood" className="w-full">
                <SelectValue placeholder="Select mood..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Happy">😊 Happy</SelectItem>
                <SelectItem value="Calm">😌 Calm</SelectItem>
                <SelectItem value="Energetic">⚡ Energetic</SelectItem>
                <SelectItem value="Tired">😴 Tired</SelectItem>
                <SelectItem value="Anxious">😰 Anxious</SelectItem>
                <SelectItem value="Sad">😢 Sad</SelectItem>
                <SelectItem value="Angry">😠 Angry</SelectItem>
                <SelectItem value="Neutral">😐 Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-text mb-1">
              Tell us more (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's on your mind? How's your day going?"
              className="w-full min-h-[100px]"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-leaf-green hover:bg-leaf-green/90"
            disabled={!mood || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MoodForm;
