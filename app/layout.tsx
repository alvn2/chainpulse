import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AppLayout } from '../components/AppLayout';

export const metadata: Metadata = {
  title: 'ChainPulse | Supply Chain Visibility',
  description: 'Supply Chain Visibility & Inventory Management',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
