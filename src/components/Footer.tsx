
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("bg-white py-8 border-t", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-lg font-bold text-leaf-green">
              Calmora
            </Link>
            <p className="text-sm text-slate-text/70 mt-1">
              Your mental wellness companion
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <Link to="/" className="text-sm text-slate-text hover:text-leaf-green">
              Home
            </Link>
            <Link to="/login" className="text-sm text-slate-text hover:text-leaf-green">
              Login
            </Link>
            <Link to="/signup" className="text-sm text-slate-text hover:text-leaf-green">
              Sign Up
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-slate-text/70">
            &copy; {new Date().getFullYear()} Calmora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
