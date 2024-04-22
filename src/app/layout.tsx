import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Link from "next/link";

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
    <nav className="bg-blue-500 p-4 text-white">
      <Link href="/">
        <h1>{metadata.title}</h1>
      </Link>
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
        <TopNav />
        {children}
      </body>
    </html>
  );
}
