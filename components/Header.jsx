"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image 
  src="/J++.png" 
  alt="J++ Logo" 
  width={48} 
  height={48} 
  className="h-10 w-10 object-contain"
/>
<span className="text-xl font-bold tracking-tight">IDE</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
            Docs
          </Link>
          <Link href="/ide" className="text-sm font-medium hover:text-primary transition-colors">
            IDE
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="glow-primary">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
