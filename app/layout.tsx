import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema Judicial',
  description: 'Creado por Jos7su',
  icons: {
    icon: '/images/SistemaJudicial.png', // Ruta relativa a la imagen en la carpeta public
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}