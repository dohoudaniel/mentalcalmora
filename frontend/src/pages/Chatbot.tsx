import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Chatbot = () => {
  return (
    <div className="min-h-screen flex flex-col bg-mint-mist dark:bg-slate-text">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 bg-white dark:bg-slate-text/90 border-leaf-green/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-leaf-green flex items-center justify-center gap-2">
                🤖 Calmobot
              </CardTitle>
              <CardDescription className="text-slate-text dark:text-mint-mist/80">
                Your AI wellness companion for mood insights and mental health support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-slate-text/70 dark:text-mint-mist/70">
                Share your thoughts, discuss your moods, and get personalized wellness advice from Calmobot.
                Remember to continue tracking your moods in Calmora for the best experience!
              </p>
            </CardContent>
          </Card>
          <ChatInterface />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chatbot;
