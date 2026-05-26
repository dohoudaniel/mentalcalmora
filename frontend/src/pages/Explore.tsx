import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw, Clock, User, ArrowRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  category: string;
  content: string;
  url: string;
}

const MENTAL_HEALTH_ARTICLES: Article[] = [
  {
    id: '1',
    title: "Understanding Mindfulness: A Beginner's Guide",
    excerpt: 'Discover the transformative power of mindfulness and how to incorporate it into your daily routine for better mental health.',
    author: 'Dr. Sarah Chen',
    readTime: '5 min read',
    category: 'Mindfulness',
    content: 'Mindfulness is the practice of being present in the moment...',
    url: 'https://www.mindful.org/how-to-meditate/',
  },
  {
    id: '2',
    title: 'Breaking the Stigma: Mental Health in the Workplace',
    excerpt: 'Learn how to create a supportive work environment and advocate for mental health awareness in professional settings.',
    author: 'Michael Rodriguez',
    readTime: '7 min read',
    category: 'Workplace Wellness',
    content: 'Mental health in the workplace is a critical issue...',
    url: 'https://www.who.int/news-room/fact-sheets/detail/mental-disorders',
  },
  {
    id: '3',
    title: 'The Science of Sleep: How Rest Affects Your Mental Health',
    excerpt: 'Explore the connection between quality sleep and emotional well-being, plus practical tips for better sleep hygiene.',
    author: 'Dr. Emily Watson',
    readTime: '6 min read',
    category: 'Sleep & Wellness',
    content: 'Sleep plays a crucial role in mental health...',
    url: 'https://www.sleepfoundation.org/mental-health',
  },
  {
    id: '4',
    title: "Building Resilience: Tools for Managing Life's Challenges",
    excerpt: 'Develop practical strategies to bounce back from adversity and build emotional strength for life\'s ups and downs.',
    author: 'James Thompson',
    readTime: '8 min read',
    category: 'Resilience',
    content: 'Resilience is not just about bouncing back...',
    url: 'https://www.apa.org/topics/resilience',
  },
  {
    id: '5',
    title: 'The Power of Connection: Building Meaningful Relationships',
    excerpt: 'Understanding how social connections impact mental health and practical ways to nurture meaningful relationships.',
    author: 'Dr. Lisa Park',
    readTime: '5 min read',
    category: 'Relationships',
    content: 'Human connection is fundamental to our well-being...',
    url: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
  },
  {
    id: '6',
    title: 'Anxiety Management: Practical Techniques That Work',
    excerpt: 'Evidence-based strategies for managing anxiety, from breathing exercises to cognitive behavioral techniques.',
    author: 'Dr. Alex Morgan',
    readTime: '9 min read',
    category: 'Anxiety Management',
    content: 'Anxiety is a normal part of life, but when it becomes overwhelming...',
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
  },
];

const CATEGORIES = [
  'All',
  'Mindfulness',
  'Workplace Wellness',
  'Sleep & Wellness',
  'Resilience',
  'Relationships',
  'Anxiety Management',
];

const Explore = () => {
  const [articles, setArticles] = useState(MENTAL_HEALTH_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shuffleArticles = useCallback(() => {
    setIsRefreshing(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setArticles((prev) => [...prev].sort(() => Math.random() - 0.5));
      setIsRefreshing(false);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const filteredArticles = useMemo(() => {
    return selectedCategory === 'All'
      ? articles
      : articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist dark:bg-slate-text/90">
        <div className="container mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-text dark:text-mint-mist">Mental Health Resources</h1>
            <p className="text-lg text-slate-text/80 dark:text-mint-mist/80 max-w-3xl mx-auto">
              Discover expert insights, practical tips, and evidence-based strategies to support your mental wellness journey
            </p>
            <div className="flex justify-center">
              <Button
                onClick={shuffleArticles}
                disabled={isRefreshing}
                variant="outline"
                className="flex items-center gap-2 border-leaf-green text-leaf-green hover:bg-leaf-green/10"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Content
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className={
                  selectedCategory === category
                    ? 'bg-leaf-green hover:bg-leaf-green/90'
                    : 'border-leaf-green text-leaf-green hover:bg-leaf-green/10'
                }
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="bg-white dark:bg-slate-text hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-text/60 dark:text-mint-mist/60">
                    <span className="bg-leaf-green/10 text-leaf-green px-2 py-1 rounded-full text-xs font-medium">{article.category}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-slate-text dark:text-mint-mist line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-text/80 dark:text-mint-mist/80 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-text/60 dark:text-mint-mist/60">
                      <User className="h-3 w-3" />
                      {article.author}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-leaf-green hover:bg-leaf-green/10 p-2"
                      onClick={() => handleArticleClick(article.url)}
                      aria-label={`Read article: ${article.title}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-text/80 dark:text-mint-mist/80 text-lg">No articles found for the selected category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
