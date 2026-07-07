import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Taskie - Project Management",
  description: "Simple, powerful, free project management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  let notifications: any[] = [];
  if (session?.user?.id) {
    notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }

  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
        <ThemeProvider>
          <LayoutWrapper user={session?.user} initialNotifications={notifications}>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
