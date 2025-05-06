// src/app/layout.tsx
import StyledComponentsRegistry from '@/lib/registry';
import type { Metadata } from 'next';
import './global.css'

export const metadata: Metadata = {
  title: `SHA'PE`,
  description: 'Music Events & DJ Performances',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
