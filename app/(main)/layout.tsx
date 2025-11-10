import "@fontsource/dm-serif-display"
import "@fontsource/roboto-mono"
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Novino.io - Art Gallery',
  description: 'Elevate ordinary walls with extraordinary galleries. Discover unique art pieces, paintings, and artefacts.',
  type: 'website',
  tags: ['art gallery', 'paintings', 'artefacts', 'art collection', 'contemporary art', 'fine art'],
})

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