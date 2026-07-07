import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import ClientWrapper from './client-wrapper';

export const metadata: Metadata = {
  title: 'GRUPO PACSA S.A. - PACSA VISIT CONTROL',
  description: 'Control de acceso de visitas a residenciales y PH con tecnología de vanguardia y IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20 selection:text-primary">
        <ClientWrapper>
          {children}
          <Toaster />
        </ClientWrapper>
      </body>
    </html>
  );
}
