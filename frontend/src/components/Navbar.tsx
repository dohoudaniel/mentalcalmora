import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, History, User, LogOut, Bot, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate-text bg-opacity-95 calmora-shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-leaf-green">Calmora</span>
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/dashboard" className="text-slate-text dark:text-mint-mist hover:text-leaf-green dark:hover:text-leaf-green px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/history" className="text-slate-text dark:text-mint-mist hover:text-leaf-green dark:hover:text-leaf-green px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <History className="h-4 w-4" />
                  History
                </Link>
                <Link to="/explore" className="text-slate-text dark:text-mint-mist hover:text-leaf-green dark:hover:text-leaf-green px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <Compass className="h-4 w-4" />
                  Explore
                </Link>
                <Link to="/chatbot" className="text-slate-text dark:text-mint-mist hover:text-leaf-green dark:hover:text-leaf-green px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <Bot className="h-4 w-4" />
                  Calmobot
                </Link>
                <Link to="/profile" className="text-slate-text dark:text-mint-mist hover:text-leaf-green dark:hover:text-leaf-green px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <ThemeToggle />
                <Button onClick={logout} variant="outline" className="flex items-center gap-1 dark:border-slate-text/30 dark:text-mint-mist">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <ThemeToggle />
                <Link to="/login">
                  <Button variant="outline" className="dark:border-slate-text/30 dark:text-mint-mist">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            </div>
          )}

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-text dark:text-mint-mist hover:text-leaf-green dark:hover:text-leaf-green focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              type="button"
            >
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu" className={cn('md:hidden', isMenuOpen ? 'block' : 'hidden')}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/history" className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                History
              </Link>
              <Link to="/explore" className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Explore
              </Link>
              <Link to="/chatbot" className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Calmobot
              </Link>
              <Link to="/profile" className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="text-slate-text dark:text-mint-mist hover:bg-lavender hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
