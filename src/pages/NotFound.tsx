import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 rounded-lg border border-border bg-card shadow-md animate-slide-in max-w-md">
        <h1 className="text-5xl font-bold mb-6 text-primary">404</h1>
        <p className="text-xl text-card-foreground mb-6">Page not found</p>
        <div className="space-y-3">
          <a href="/" className="block text-primary hover:text-primary/80 underline transition-colors">
            Return to Home
          </a>
          <a href="/help" className="block text-primary hover:text-primary/80 underline transition-colors">
            Visit Help Center
          </a>
          <a href="/odyssey" className="block text-primary hover:text-primary/80 underline transition-colors">
            Go to ODYSSEY-1
          </a>
        </div>
      </div>
    </div>
    );
  };

export default NotFound;
