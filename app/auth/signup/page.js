"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Github, Chrome } from "lucide-react";
import Image from "next/image";
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just navigate to IDE
    router.push("/ide");
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      <ThreeBackground variant="particles" />
            <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center space-y-4 p-8">
<h2 className="text-4xl font-bold flex items-center justify-center gap-3">
  Welcome to
  <Image
    src="/J++.png"
    alt="J++ Logo"
    width={120}
    height={120}
    className="h-18 w-18 object-contain"
  />
  IDE
</h2>          <p className="text-xl text-muted-foreground">
            Your browser-based development environment
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 relative">
        <Card className="w-full max-w-md p-8 glass-panel">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-muted-foreground">
                Start coding in J++ today
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <Button type="submit" className="w-full glow-primary">
                Create Account
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button variant="outline" className="w-full">
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
