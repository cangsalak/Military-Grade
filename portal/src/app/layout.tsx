import { Outfit, Sarabun } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "900"], variable: '--font-outfit' });
const ibmPlexThai = Sarabun({ subsets: ["thai"], weight: ["300", "400", "500", "600", "700"], variable: '--font-thai' });

export const metadata = {
  title: "MIL-SPEC WireGuard | Zero-Trust Identity Matrix",
  description: "Enterprise Encryption Orchestration Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${ibmPlexThai.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
