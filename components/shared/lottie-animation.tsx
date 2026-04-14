"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

interface LottieAnimationProps {
  src: string;
  className?: string;
  loop?: boolean;
}

export function LottieAnimation({ src, className, loop = true }: LottieAnimationProps) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(src)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => { if (json) setData(json); })
      .catch(() => {});
  }, [src]);

  if (!data) return null;

  return (
    <Lottie
      animationData={data}
      loop={loop}
      className={className}
    />
  );
}
