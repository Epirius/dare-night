import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "~/components/theme-provider";
import { ThemeToggle } from "./ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Dare Night",
  description: "App for organizing dares with your friends.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

function TopNav() {
  return (
    <nav className="flex w-full items-center justify-between border-b p-4 text-lg font-semibold">
      <Link href="/" className="text-2xl">
        <h1>{metadata.title}</h1>
      </Link>
      <ThemeToggle />
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopNav />
          <div className="container mx-auto py-4">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
