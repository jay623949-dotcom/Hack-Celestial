import './globals.css';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { RoleProvider } from '../lib/roleContext';

export const metadata = {
  title: 'RESORT 360 — AI-Powered Resort Operations & Decision Intelligence',
  description: 'Connect operational context across Front Desk, Housekeeping, Maintenance, and Revenue. Specialized AI agents reason together to generate explainable action plans for hotel managers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
