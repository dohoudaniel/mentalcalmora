import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import type { MoodEntry } from '@/types';

interface MoodHistoryItemProps {
  entry: MoodEntry;
  showLink?: boolean;
}

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
    case 'POSITIVE': return 'bg-gradient-to-r from-leaf-green/10 to-sky-blue/10 dark:from-leaf-green/20 dark:to-sky-blue/20';
    case 'NEGATIVE': return 'bg-gradient-to-r from-peach-glow/20 to-peach-glow/10 dark:from-peach-glow/30 dark:to-peach-glow/20';
    default: return 'bg-gradient-to-r from-lavender/10 to-lavender/5 dark:from-lavender/20 dark:to-lavender/10';
  }
};

const MoodHistoryItem = ({ entry, showLink = true }: MoodHistoryItemProps) => {
  const formattedDate = format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a");

  return (
    <div className={cn('p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow', getSentimentColor(entry.sentiment))}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{getMoodEmoji(entry.mood)}</span>
          <div>
            <h4 className="font-medium text-slate-text dark:text-mint-mist">{entry.mood}</h4>
            <p className="text-xs text-slate-text/70 dark:text-mint-mist/70">{formattedDate}</p>
          </div>
        </div>
        {showLink && (
          <Link to={`/results/${entry.id}`} className="text-sm font-medium text-leaf-green hover:text-leaf-green/80">
            View details
          </Link>
        )}
      </div>

      {entry.text && (
        <p className="mt-2 text-sm text-slate-text dark:text-mint-mist/90">{entry.text}</p>
      )}

      {entry.insights && (
        <div className="mt-3 p-3 rounded-md bg-white/50 dark:bg-slate-text/20 border-l-4 border-leaf-green">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-leaf-green mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-slate-text dark:text-mint-mist mb-1">Personalized Insight</h5>
              <p className="text-sm text-slate-text/80 dark:text-mint-mist/80">{entry.insights}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodHistoryItem;
