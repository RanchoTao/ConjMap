import type { Metadata } from 'next';
import { Footer, Header } from '@/components/shell';
import 'katex/dist/katex.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'ConjMap — Mapping the Frontiers of Mathematics', template: '%s · ConjMap' },
  description:
    'An open, interactive, evidence-traceable map of mathematical problems and research frontiers.',
};
const themeScript = `(function(){try{var t=localStorage.getItem('conjmap-theme-v1');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){}})()`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
