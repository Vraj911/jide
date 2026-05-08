"use client";
import Link from "next/link";
import {Book } from "lucide-react";
export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Built with Next.js, Monaco, Tailwind & Shadcn
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">
              <Book className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
