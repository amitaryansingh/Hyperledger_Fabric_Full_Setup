// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { Toaster } from "@/components/ui/sonner"; // Import the new Sonner component

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Land Acquisition System",
//   description: "Admin Dashboard for Land Acquisition",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         {children}
//         <Toaster richColors /> {/* Add the Toaster component here */}
//       </body>
//     </html>
//   );
// }


// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Land Record System",
  description: "A decentralized application for land record management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}