"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image 
  src="/J++.png" 
  alt="J++ Logo" 
  width={48} 
  height={48} 
  className="h-10 w-10 object-contain"
/>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="px-2 sm:px-3">
              Login
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="glow-primary px-3 sm:px-4">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
