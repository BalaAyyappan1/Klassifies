import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const mont = localFont({
  src: [
    {
      path: "../fonts/Mont/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Mont/Montserrat-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Mont/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mont",
});

// const jet = localFont({
//   src: [
//     {
//       path: "../fonts/Jet/JetBrainsMono-Regular.ttf",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../fonts/Jet/JetBrainsMono-Medium.ttf",
//       weight: "500",
//       style: "normal",
//     },
//     {
//       path: "../fonts/Jet/JetBrainsMono-Bold.ttf",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-jet",
// });

export const metadata: Metadata = {
  title: "Klassifies",
  description: "Post free ads and find exactly what you need on Klassifies. Explore thousands of listings, from jobs to real estate, and connect with buyers and sellers in your area today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${mont.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
