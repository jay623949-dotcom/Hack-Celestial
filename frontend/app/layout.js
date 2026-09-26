import './globals.css';

export const metadata = {
  title: 'RESORT 360 - AI-Powered Resort Operations Platform',
  description: 'Production foundation for Resort 360 platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
