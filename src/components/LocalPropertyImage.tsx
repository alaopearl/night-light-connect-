import { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { resolveLocalPhotoUrl } from "../../backend/localBackend";

interface LocalPropertyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export default function LocalPropertyImage({ src, ...props }: LocalPropertyImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    let active = true;
    void resolveLocalPhotoUrl(src).then((url) => {
      if (active) setResolvedSrc(url);
    });
    return () => { active = false; };
  }, [src]);

  return <img {...props} src={resolvedSrc} />;
}
