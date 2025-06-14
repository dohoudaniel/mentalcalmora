
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Calendar, CheckCircle, User } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-mint-mist py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-1/2 space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
                  Your Journey to <span className="text-leaf-green">Better Mental Health</span> Starts Here
                </h1>
                <p className="text-lg text-slate-text/80">
                  Track your mood, get personalized recommendations, and improve your mental wellness with Calmora.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="calmora-shadow bg-leaf-green hover:bg-leaf-green/90">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-leaf-green text-leaf-green hover:bg-leaf-green/10">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="aspect-square w-full max-w-md mx-auto relative">
                  <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-leaf-green opacity-20 animate-float"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-lavender opacity-30 animate-float" style={{ animationDelay: "2s" }}></div>
                  <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-sky-blue opacity-20 animate-float" style={{ animationDelay: "1s" }}></div>
                  <div className="relative z-10 bg-white p-6 rounded-2xl shadow-xl calmora-shadow">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-2">😊</span>
                      <div>
                        <h3 className="font-medium text-slate-text">Happy</h3>
                        <p className="text-xs text-slate-text/70">Today at 9:45 AM</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-text mb-4">
                      I'm feeling great today! My morning meditation really helped me start the day on a positive note.
                    </p>
                    <div className="bg-leaf-green/10 p-3 rounded-lg">
                      <h4 className="font-medium text-leaf-green text-sm">Recommendation</h4>
                      <p className="text-xs text-slate-text">
                        Maintain your positive momentum by sharing your good energy with someone today!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-text mb-4">
                Features Designed For Your Wellbeing
              </h2>
              <p className="text-lg text-slate-text/80 max-w-2xl mx-auto">
                Calmora helps you track your mental health journey with tools designed to support your wellbeing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-mint-mist p-6 rounded-xl calmora-shadow calmora-card-hover">
                <div className="bg-leaf-green h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-text mb-2">Mood Tracking</h3>
                <p className="text-slate-text/80">
                  Record your daily mood and experiences to identify patterns over time.
                </p>
              </div>
              
              <div className="bg-mint-mist p-6 rounded-xl calmora-shadow calmora-card-hover">
                <div className="bg-sky-blue h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-text mb-2">AI Analysis</h3>
                <p className="text-slate-text/80">
                  Get intelligent insights from our AI based on your mood entries and patterns.
                </p>
              </div>
              
              <div className="bg-mint-mist p-6 rounded-xl calmora-shadow calmora-card-hover">
                <div className="bg-lavender h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-text mb-2">Health Tips</h3>
                <p className="text-slate-text/80">
                  Receive personalized wellness recommendations to improve your mental health.
                </p>
              </div>
              
              <div className="bg-mint-mist p-6 rounded-xl calmora-shadow calmora-card-hover">
                <div className="bg-peach-glow h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-text mb-2">Progress Tracking</h3>
                <p className="text-slate-text/80">
                  Monitor your improvement over time and celebrate your mental health journey.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-16 bg-gradient-to-b from-white to-mint-mist dark:from-background dark:to-background">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-text dark:text-foreground mb-4">
                How Calmora Helps
              </h2>
              <p className="text-lg text-slate-text/80 dark:text-foreground/80 max-w-2xl mx-auto">
                Real stories from people who have improved their mental wellness with Calmora.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-lavender/30 flex items-center justify-center">
                    <span className="text-lg">JM</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-slate-text dark:text-foreground">Jamie M.</h3>
                    <p className="text-xs text-slate-text/70 dark:text-muted-foreground">Using Calmora for 3 months</p>
                  </div>
                </div>
                <p className="text-slate-text dark:text-foreground">
                  "Tracking my moods daily has helped me notice patterns I never saw before. The recommendations are always spot-on."
                </p>
              </div>
              
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-sky-blue/30 flex items-center justify-center">
                    <span className="text-lg">ST</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-slate-text dark:text-foreground">Sam T.</h3>
                    <p className="text-xs text-slate-text/70 dark:text-muted-foreground">Using Calmora for 6 months</p>
                  </div>
                </div>
                <p className="text-slate-text dark:text-foreground">
                  "The AI analysis gives me actionable insights that have genuinely improved my mental health. I'm much more aware of my emotions now."
                </p>
              </div>
              
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-leaf-green/30 flex items-center justify-center">
                    <span className="text-lg">LK</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-slate-text dark:text-foreground">Lee K.</h3>
                    <p className="text-xs text-slate-text/70 dark:text-muted-foreground">Using Calmora for 2 months</p>
                  </div>
                </div>
                <p className="text-slate-text dark:text-foreground">
                  "I love how Calmora doesn't just track my mood but gives me practical tips to improve it. It's like having a wellness coach in my pocket."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-mint-mist">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg calmora-shadow">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-text mb-4">
                  Start Your Mental Wellness Journey Today
                </h2>
                <p className="text-lg text-slate-text/80 mb-8">
                  Join thousands of people who are taking control of their mental health with Calmora.
                </p>
                <Link to="/signup">
                  <Button size="lg" className="bg-leaf-green hover:bg-leaf-green/90 px-8">
                    Create Your Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer className="bg-white" />
    </div>
  );
};

export default Landing;
