
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Clock, User, ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  category: string;
  content: string;
}

const mentalHealthArticles: Article[] = [
  {
    id: "1",
    title: "Understanding Mindfulness: A Beginner's Guide",
    excerpt: "Discover the transformative power of mindfulness and how to incorporate it into your daily routine for better mental health.",
    author: "Dr. Sarah Chen",
    readTime: "5 min read",
    category: "Mindfulness",
    content: "Mindfulness is the practice of being present in the moment..."
  },
  {
    id: "2",
    title: "Breaking the Stigma: Mental Health in the Workplace",
    excerpt: "Learn how to create a supportive work environment and advocate for mental health awareness in professional settings.",
    author: "Michael Rodriguez",
    readTime: "7 min read",
    category: "Workplace Wellness",
    content: "Mental health in the workplace is a critical issue..."
  },
  {
    id: "3",
    title: "The Science of Sleep: How Rest Affects Your Mental Health",
    excerpt: "Explore the connection between quality sleep and emotional well-being, plus practical tips for better sleep hygiene.",
    author: "Dr. Emily Watson",
    readTime: "6 min read",
    category: "Sleep & Wellness",
    content: "Sleep plays a crucial role in mental health..."
  },
  {
    id: "4",
    title: "Building Resilience: Tools for Managing Life's Challenges",
    excerpt: "Develop practical strategies to bounce back from adversity and build emotional strength for life's ups and downs.",
    author: "James Thompson",
    readTime: "8 min read",
    category: "Resilience",
    content: "Resilience is not just about bouncing back..."
  },
  {
    id: "5",
    title: "The Power of Connection: Building Meaningful Relationships",
    excerpt: "Understanding how social connections impact mental health and practical ways to nurture meaningful relationships.",
    author: "Dr. Lisa Park",
    readTime: "5 min read",
    category: "Relationships",
    content: "Human connection is fundamental to our well-being..."
  },
  {
    id: "6",
    title: "Anxiety Management: Practical Techniques That Work",
    excerpt: "Evidence-based strategies for managing anxiety, from breathing exercises to cognitive behavioral techniques.",
    author: "Dr. Alex Morgan",
    readTime: "9 min read",
    category: "Anxiety Management",
    content: "Anxiety is a normal part of life, but when it becomes overwhelming..."
  }
];

const categories = ["All", "Mindfulness", "Workplace Wellness", "Sleep & Wellness", "Resilience", "Relationships", "Anxiety Management"];

const Explore = () => {
  const { currentUser } = useAuth();
  const [articles, setArticles] = useState(mentalHealthArticles);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const shuffleArticles = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const shuffled = [...articles].sort(() => Math.random() - 0.5);
      setArticles(shuffled);
      setIsRefreshing(false);
    }, 500);
  };

  const filteredArticles = selectedCategory === "All" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist dark:bg-slate-text/90">
        <div className="container mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-text dark:text-mint-mist">
              Mental Health Resources
            </h1>
            <p className="text-lg text-slate-text/80 dark:text-mint-mist/80 max-w-3xl mx-auto">
              Discover expert insights, practical tips, and evidence-based strategies to support your mental wellness journey
            </p>
            
            {/* Refresh Button */}
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

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={selectedCategory === category 
                  ? "bg-leaf-green hover:bg-leaf-green/90" 
                  : "border-leaf-green text-leaf-green hover:bg-leaf-green/10"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="bg-white dark:bg-slate-text hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-text/60 dark:text-mint-mist/60">
                    <span className="bg-leaf-green/10 text-leaf-green px-2 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-slate-text dark:text-mint-mist line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-text/80 dark:text-mint-mist/80 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-text/60 dark:text-mint-mist/60">
                      <User className="h-3 w-3" />
                      {article.author}
                    </div>
                    <Button size="sm" variant="ghost" className="text-leaf-green hover:bg-leaf-green/10 p-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-text/80 dark:text-mint-mist/80 text-lg">
                No articles found for the selected category.
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-leaf-green/10 dark:bg-leaf-green/20 p-6 sm:p-8 rounded-lg text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-text dark:text-mint-mist">
              Ready to start your wellness journey?
            </h2>
            <p className="text-slate-text/80 dark:text-mint-mist/80">
              Track your mood, get personalized insights, and connect with our AI companion
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-leaf-green hover:bg-leaf-green/90">
                Get Started Today
              </Button>
              <Button variant="outline" className="border-leaf-green text-leaf-green hover:bg-leaf-green/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Explore;
