import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AppLayout } from '../components/AppLayout';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ChainPulse | Supply Chain Visibility',
  description: 'Supply Chain Visibility & Inventory Management',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
