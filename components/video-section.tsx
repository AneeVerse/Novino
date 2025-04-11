import { useRef, useState } from "react"

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="mx-4 md:mx-8 mb-16 relative">
      <div className="relative w-full overflow-hidden rounded-lg">
        <video 
          ref={videoRef}
          className="w-full h-auto object-contain"
          src="/video/videoplayback (1).mp4"
          poster="/images/gallery-grid.png"
          onClick={togglePlay}
          controls={false}
          playsInline
          muted={false}
        />

        {/* Dark overlay on the poster image - only show when video is not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/50" onClick={togglePlay}></div>
        )}

        {/* Play button overlay - show when video is not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            <div className="bg-white bg-opacity-80 rounded-full p-4 hover:bg-opacity-100 transition-all transform hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L18 12L6 20V4Z" fill="black" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
        
        {/* Pause button overlay - only show when video is playing */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity" onClick={togglePlay}>
            <div className="bg-white bg-opacity-80 rounded-full p-4 hover:bg-opacity-100 transition-all transform hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="4" width="4" height="16" rx="1" fill="black"/>
                <rect x="14" y="4" width="4" height="16" rx="1" fill="black"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

