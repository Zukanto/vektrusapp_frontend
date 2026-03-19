import * as React from "react"
import { motion } from "framer-motion";

export interface ImageGenerationProps {
  children: React.ReactNode;
  isGenerating: boolean;
}

export const ImageGeneration = (
  ({ children, isGenerating} : ImageGenerationProps) => {
    const [progress, setProgress] = React.useState(0);
    const [loadingState, setLoadingState] = React.useState<
      "starting" | "generating" | "completed"
    >("starting");

    React.useEffect(() => {
      if (!isGenerating && loadingState !== "starting") {
        setProgress(100);
        setLoadingState("completed");
        return;
      }

      if (!isGenerating) return;

      const startingTimeout = setTimeout(() => {
        setLoadingState("generating");

        const startTime = Date.now();

        const interval = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const progressPercentage = Math.min(95, (elapsedTime / 20000) * 95);

          setProgress(progressPercentage);
        }, 50);

        return () => clearInterval(interval);
      }, 1000);

      return () => clearTimeout(startingTimeout);
    }, [isGenerating, loadingState]);

    return (
      <div className="flex flex-col gap-2">
        <motion.span
          className="bg-[linear-gradient(110deg,#7A7A7A,35%,#111111,50%,#7A7A7A,75%,#7A7A7A)] bg-[length:200%_100%] bg-clip-text text-transparent text-base font-medium"
          initial={{ backgroundPosition: "200% 0" }}
          animate={{
            backgroundPosition:
              loadingState === "completed" ? "0% 0" : "-200% 0",
          }}
          transition={{
            repeat: loadingState === "completed" ? 0 : Infinity,
            duration: 3,
            ease: "linear",
          }}
        >
          {loadingState === "starting" && "Vorbereitung läuft..."}
          {loadingState === "generating" && "Bild wird erstellt. Einen Moment bitte."}
          {loadingState === "completed" && "Bild erfolgreich erstellt."}
        </motion.span>
        <div className="relative rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white max-w-md overflow-hidden">
            {children}
          <motion.div
            className="absolute w-full h-[125%] -top-[25%] pointer-events-none backdrop-blur-3xl"
            initial={false}
            animate={{
              clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
              opacity: loadingState === "completed" ? 0 : 1,
            }}
            style={{
              clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
              maskImage:
                progress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
              WebkitMaskImage:
                progress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
            }}
          />
        </div>
      </div>
    );
  }
);

ImageGeneration.displayName = "ImageGeneration";
