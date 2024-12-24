"use client";

import Ripple from "@/components/ui/ripple";
import FlipText from "@/components/ui/flip-text";
import NumberTicker from "./ui/number-ticker";
import BlurFade from "./ui/blur-fade";
import Image from "next/image";
import logo from "./logo.png";
import { cn } from "@/lib/utils";

interface OrderProps {
  value: string;
  status: 'processing' | 'ready' | 'completed';
  severity: number;
  completed?: boolean;
}

export function Order({ value, status, severity, completed }: OrderProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'ready':
        return 'text-blue-600';
      default:
        return 'text-[#0f2f76]';
    }
  };

  const getTitle = () => {
    if (completed) return "Completed";
    if (status === 'ready') return "Ready";
    return `Priority ${severity}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-4 space-y-4 text-center">
      <BlurFade duration={0.6} yOffset={10} blur="10px">
        <Image
          src={logo}
          alt="Logo"
          className="w-24 h-24 md:w-32 md:h-32 mb-4"
        />
      </BlurFade>
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
        <FlipText
          className={cn(
            "text-4xl font-bold -tracking-widest md:text-7xl md:leading-[5rem]",
            getStatusColor(),
            "dark:text-white"
          )}
          word={getTitle()}
        />
      </p>
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
        <p className={cn(
          "whitespace-pre-wrap text-8xl font-medium tracking-tighter",
          getStatusColor(),
          "dark:text-white"
        )}>
          <NumberTicker value={parseInt(value)} />
        </p>
        <Ripple />
      </div>
    </div>
  );
}
