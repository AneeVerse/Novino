"use client"

import Image from "next/image"

type PreloaderProps = {
  ariaLabel?: string
}

export default function Preloader({ ariaLabel }: PreloaderProps) {
  return (
    <div
      aria-label={ariaLabel ?? "Loading"}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "#2D2D2D" }}
    >
      <Image
        src="/images/preloader/preloader.gif"
        alt="Loading"
        width={160}
        height={160}
        priority
      />
    </div>
  )
}