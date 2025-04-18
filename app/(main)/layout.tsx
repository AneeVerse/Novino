import "@fontsource/dm-serif-display"
import "@fontsource/roboto-mono"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Novino.io - Art Gallery',
  description: 'Elevate ordinary walls with extraordinary galleries',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#2D2D2D]">
      <main>
        {children}
      </main>
    </div>
  )
} 