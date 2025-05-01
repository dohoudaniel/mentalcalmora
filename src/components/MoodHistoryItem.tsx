
import { format } from "date-fns";
import { MoodEntry } from "@/contexts/MoodContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface MoodHistoryItemProps {
  entry: MoodEntry;
  showLink?: boolean;
}

const MoodHistoryItem = ({ entry, showLink = true }: MoodHistoryItemProps) => {
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
  
  // Function to get background color based on sentiment
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-gradient-to-r from-leaf-green/10 to-sky-blue/10';
      case 'NEGATIVE': return 'bg-gradient-to-r from-peach-glow/20 to-peach-glow/10';
      default: return 'bg-gradient-to-r from-lavender/10 to-lavender/5';
    }
  };

  const formattedDate = format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a");

  return (
    <div 
      className={cn(
        "p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow",
        getSentimentColor(entry.sentiment)
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {getMoodEmoji(entry.mood || '')}
          </span>
          <div>
            <h4 className="font-medium text-slate-text">{entry.mood}</h4>
            <p className="text-xs text-slate-text/70">{formattedDate}</p>
          </div>
        </div>
        
        {showLink && (
          <Link 
            to={`/results/${entry.id}`}
            className="text-sm font-medium text-leaf-green hover:text-leaf-green/80"
          >
            View details
          </Link>
        )}
      </div>
      
      {entry.text && (
        <p className="mt-2 text-sm text-slate-text">
          {entry.text}
        </p>
      )}
    </div>
  );
};

export default MoodHistoryItem;
