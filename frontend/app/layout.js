import './globals.css';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { RoleProvider } from '../lib/roleContext';
import Navbar from '../components/navbar/Navbar';

export const metadata = {
  title: 'Atria intelligence — AI-Powered Resort Operations Platform',
  description: 'Clean, approachable enterprise swarm intelligence across Front Desk, Housekeeping, Maintenance, and Revenue.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-odoo-purple/20 selection:text-odoo-purple flex flex-col">
        <ThemeProvider>
          <RoleProvider>
            {/* Global Atria Intelligence Navbar (Hidden automatically on /dashboard routes) */}
            <Navbar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-full">
              {children}
            </div>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

