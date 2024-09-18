"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Shuffle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Cloud,
} from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const DreamworldLogo: React.FC = () => (
  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
    <Cloud className="w-6 h-6 text-white" />
  </div>
);

interface StyleOption {
  name: string;
  image: string;
}

const styleOptions: StyleOption[] = [
  { name: "Cute", image: "/cute.webp" },
  { name: "Fun", image: "/fun.webp" },
  { name: "Scary", image: "/scary.webp" },
  {
    name: "Serene",
    image: "/serene.webp",
  },
];

const surprisePrompts: string[] = [
  "A pudgy penguin surfing on a glacier",
  "Penguins having a dance party under the Northern Lights",
  "A penguin explorer discovering an ancient ice cave",
  "Penguins building a high-tech igloo laboratory",
  "A penguin superhero saving the Antarctic",
];

interface GeneratedImage {
  id: number;
  url: string;
  status: "loading" | "complete";
  prompt?: string;
}

const CloudSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512"
    className={className}
    fill="currentColor"
  >
    <path d="M0 336c0 79.5 64.5 144 144 144H512c70.7 0 128-57.3 128-128c0-61.9-44-113.6-102.4-125.4c4.1-10.7 6.4-22.4 6.4-34.6c0-53-43-96-96-96c-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32C167.6 32 96 103.6 96 192c0 2.7 .1 5.4 .2 8.1C40.2 219.8 0 273.2 0 336z" />
  </svg>
);

const Component: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Dreaming");

  const loadingTexts = [
    "Dreaming",
    "Imagining",
    "Conjuring",
    "Visualizing",
    "Manifesting",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      let index = 0;
      interval = setInterval(() => {
        setLoadingText(loadingTexts[index]);
        index = (index + 1) % loadingTexts.length;
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const generateSurprisePrompt = () => {
    const randomPrompt =
      surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setPrompt(randomPrompt);
  };

  const generateImage = async () => {
    const newImageId = Date.now();
    setGeneratedImages((prev) => [
      { id: newImageId, url: "", status: "loading" },
      ...prev,
    ]);
    setIsLoading(true);
    setError(null);

    try {
      if (!prompt || !selectedStyle) {
        throw new Error("Missing prompt or style");
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Missing prompt or style");
        } else {
          throw new Error("Failed to generate image");
        }
      }

      const { imageUrl, generatedPrompt } = await response.json();

      setGeneratedImages((prev) =>
        prev.map((img) =>
          img.id === newImageId
            ? {
                ...img,
                url: imageUrl,
                status: "complete",
                prompt: generatedPrompt,
              }
            : img
        )
      );
    } catch (error) {
      console.error("Error generating image:", error);
      setGeneratedImages((prev) => prev.filter((img) => img.id !== newImageId));
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-white text-gray-900 relative overflow-hidden">
      <CloudSVG className="absolute top-10 left-10 w-24 h-24 text-white opacity-50 animate-float" />
      <CloudSVG className="absolute top-1/4 right-1/3 w-32 h-32 text-white opacity-30 animate-float-slow" />
      <CloudSVG className="absolute bottom-1/4 left-1/4 w-40 h-40 text-white opacity-20 animate-float-slower" />

      <header className="bg-white bg-opacity-80 backdrop-blur-md py-4 px-6 flex justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center space-x-2">
          <DreamworldLogo />
          <h1 className="text-xl font-bold text-gray-900">Dreamworld</h1>
        </div>
        <nav className="flex space-x-4">
          <Button variant="ghost">Create</Button>
          <Button variant="ghost">My Dreams</Button>
          <Button variant="ghost">API</Button>
        </nav>
      </header>

      <main className="flex-grow flex p-6 space-x-6 relative z-10">
        <div className="w-1/2 bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-6 shadow-lg">
          <div className="space-y-4">
            <textarea
              className="w-full h-40 px-4 py-2 rounded-md bg-white bg-opacity-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border border-gray-200"
              placeholder="Describe your penguin dream scene..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-between">
              <Button
                onClick={generateSurprisePrompt}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Surprise Me
              </Button>
              <Button
                onClick={() => setPrompt("")}
                variant="outline"
                className="text-gray-600 hover:text-gray-900 bg-white bg-opacity-50"
              >
                Clear
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Style</h2>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map((style) => (
                <Button
                  key={style.name}
                  variant="outline"
                  className={`bg-white bg-opacity-50 hover:bg-opacity-75 relative overflow-hidden h-24`}
                  onClick={() => setSelectedStyle(style.name)}
                >
                  <img
                    src={style.image}
                    alt={style.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      selectedStyle === style.name ? "opacity-70" : "opacity-30"
                    } ${
                      selectedStyle === style.name ? "" : "hover:opacity-50"
                    }`}
                  />
                  <span
                    className="relative z-10 text-white text-xl font-bold tracking-wide"
                    style={{
                      textShadow: `
        -1px -1px 0 #000,  
         1px -1px 0 #000,
        -1px  1px 0 #000,
         1px  1px 0 #000,
         2px  2px 4px rgba(0,0,0,0.5)
      `,
                    }}
                  >
                    {style.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <Button
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105"
            onClick={generateImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {loadingText}...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Dreamify
              </>
            )}
          </Button>
          {error && (
            <div className="mt-4 text-red-500 text-center">{error}</div>
          )}
        </div>
        <div className="w-1/2 space-y-6 overflow-y-auto">
          {generatedImages.map((image, index) => (
            <div
              key={image.id}
              className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-4 shadow-lg"
            >
              <div className="aspect-video relative overflow-hidden rounded-md bg-gray-100">
                {image.status === "loading" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt={`Generated Penguin Dream Scene ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/50 hover:bg-white/70"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/50 hover:bg-white/70"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/50 hover:bg-white/70"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/50 hover:bg-white/70"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white bg-opacity-50"
                >
                  Re-dream
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white bg-opacity-50"
                >
                  Enhance
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Component;
