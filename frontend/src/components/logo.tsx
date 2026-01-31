import * as React from "react"
import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <Image
      width={size}
      height={size}
      src="/favicon-dark.png"
      className={className}
      alt="FinFox Logo"
    />
  )
}
