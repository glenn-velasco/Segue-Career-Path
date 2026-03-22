import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider"

const robotoSlab = Roboto_Slab({ subsets: ['latin'], variable: '--font-serif' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Segue Career Path",
  description: "Segue Career Path is a dynamic career platform to address the critical socio-economic hurdles of unemployment and underemployment in the Philippines. By leveraging AI-driven role matching and interactive preparation tools, Segue Career Path empowers the emerging workforce to navigate the labor market with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, "font-serif", robotoSlab.variable)} suppressHydrationWarning>
      <body

        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        {/* Forced to be darkmode for now */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
