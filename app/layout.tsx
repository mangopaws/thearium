import type { Metadata } from 'next'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Arium — A Living Encyclopedia',
  description: 'A living atlas of connected things. Each specimen is a thread — organisms, systems, phenomena, and the quiet processes that bind them.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="twilight">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('arium-theme');if(t&&['twilight','night','mist'].includes(t))document.documentElement.dataset.theme=t}catch(e){}})()`,
          }}
        />
        <script defer src="https://analytics.abreeze.studio/script.js" data-website-id="35071b79-70ae-4b2c-ac0a-997c1ca089f2" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
