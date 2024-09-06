import React, { useEffect, useRef } from "react";

const IndeterminateLoadingBar = () => {
  const foregroundRef = useRef(null);

  useEffect(() => {
    const foregroundElement =
      foregroundRef.current as unknown as HTMLDivElement;
    console.log(foregroundElement);
    let start: number | undefined;

    const step: FrameRequestCallback = (timestamp) => {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;

      const duration = 4000;
      const progress = (elapsed % duration) / duration;
      const translateX = -150 + progress * 450;

      foregroundElement.style.transform = `translateX(${translateX}%)`;

      requestAnimationFrame(step);
    };

    const animationId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className={`bg-primary-300 h-1 w-full overflow-hidden rounded-full`}>
      <div
        ref={foregroundRef}
        className={"bg-primaryColor z-20 h-full rounded-full"}
        style={{
          width: "50%", // Width of the moving bar
        }}
      >
        Hello
      </div>
    </div>
  );
};

export default IndeterminateLoadingBar;
