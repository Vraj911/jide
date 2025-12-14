import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/src/index.css";
export const metadata = {
  title: "J++ IDE - Modern Web-Based IDE for Custom Language",
  description: "Build, compile, and run J++ code in your browser. A modern web-based IDE with VS Code features, instant compilation, and live output.",
  icons: {
    icon: '/J++.png',
    shortcut: '/J++.png',
    apple: '/J++.png',
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
