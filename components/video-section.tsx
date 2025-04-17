import { useRef, useState } from "react"
import Image from "next/image"

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
    <div className="absolute inset-0 w-full h-full">
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/video/videoplayback (1).mp4"
        poster="/images/hero-section/bg02.png"
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
          <div className="relative flex items-center justify-center transition-all transform hover:scale-105">
            <Image
              src="/images/Ellipse 6.svg"
              alt="Play Button"
              width={320}
              height={320}
              className="w-[320px] h-[320px]"
            />
            <div className="absolute" style={{ marginLeft: "8px" }}>
              <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L18 12L6 20V4Z" fill="#E8B08A" stroke="#E8B08A" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Pause button overlay - only show when video is playing */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity" onClick={togglePlay}>
          <div className="relative flex items-center justify-center transition-all transform hover:scale-110">
            <div className="absolute">
              <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="4" width="4" height="16" rx="1" fill="#E8B08A" stroke="#E8B08A" strokeWidth="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1" fill="#E8B08A" stroke="#E8B08A" strokeWidth="1"/>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

