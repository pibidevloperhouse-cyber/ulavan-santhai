"use client";

import React from "react";
import Image from "next/image";

/**
 * HandshakeLoader
 * Renders ONLY the animated handshake design (the two green hands shaking)
 * with zero background card, zero text, and zero letter 't' artifact.
 */
export default function HandshakeLoader({
  fullscreen = true,
  className = "",
}) {
  const handshake = (
    <div
      className={`relative overflow-hidden flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{
        width: "155px",
        height: "100px",
      }}
      role="status"
      aria-label="Loading..."
    >
      <Image
        src="/images/ulavan-mart-animated.gif"
        alt="Handshake Loading"
        width={719}
        height={234}
        unoptimized
        priority
        className="max-w-none"
        style={{
          width: "360px",
          height: "auto",
          marginLeft: "-202px", // Perfectly clips off 'Ulavan Mart' including the letter 't'
        }}
      />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs animate-in fade-in duration-150 select-none pointer-events-none">
        {handshake}
      </div>
    );
  }

  return handshake;
}
