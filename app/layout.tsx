import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema Judicial',
  description: 'Creado por Jos7su',
  openGraph: {
  images: [
      {
        url: 'https://png.pngtree.com/png-vector/20241025/ourlarge/pngtree-court-equipment-law-book-and-scale-png-image_14169747.png', // Ruta a la imagen
        width: 800,
        height: 600,
        alt: 'Imagen representativa del Sistema Judicial', // Descripción de la imagen
      },
    ],
  }
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
