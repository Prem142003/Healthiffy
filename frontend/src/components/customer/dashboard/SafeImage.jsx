import { useEffect, useState } from "react";

const SafeImage = ({ src, alt, className = "", fallback = "HF", eager = false }) => {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`${className} safe-image-fallback`}
        role="img"
        aria-label={`${alt || "Content"} image unavailable`}
      >
        <span>{fallback}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={() => setHasError(true)}
    />
  );
};

export default SafeImage;
