import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      window.location.pathname
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 rounded-lg border border-border bg-card shadow-md animate-slide-in max-w-md">
        <h1 className="text-5xl font-bold mb-6 text-primary">404</h1>
        <p className="text-xl text-card-foreground mb-6">Page not found</p>
        <div className="space-y-3">
          <Link to="/" className="block text-primary hover:text-primary/80 underline transition-colors">
            Return to Home
          </Link>
          <Link to="/app" className="block text-primary hover:text-primary/80 underline transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
    );
  };

export default NotFound;
