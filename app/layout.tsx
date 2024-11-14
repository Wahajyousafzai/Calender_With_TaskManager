import {
  ClerkProvider,
  SignInButton,
  SignIn,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from './contexts/ThemeContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EaseFlow",
  description: "Organize with Ease",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} -z-50`}>
          <header className="flex items-center m-2 justify-between bg-gray-200">
            <h1>EaseFlow</h1>
            <UserButton showName />
          </header>
          <br />
          <ThemeProvider>
        <span className='flex flex-col min-h-screen'>
            <SignedOut>
              <SignIn  routing="hash" />
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
          </span>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
} 