import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-primary p-2 group-hover:glow-primary transition-all">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">J++ IDE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/docs" className="text-sm font-medium hover:text-primary transition-colors">
            Docs
          </Link>
          <Link to="/ide" className="text-sm font-medium hover:text-primary transition-colors">
            IDE
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/auth/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/auth/signup">
            <Button size="sm" className="glow-primary">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
