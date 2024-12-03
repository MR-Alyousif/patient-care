"use client";

import Ripple from "@/components/ui/ripple";
import FlipText from "@/components/ui/flip-text";
import NumberTicker from "./ui/number-ticker";
import BlurFade from "./ui/blur-fade";
import Image from "next/image";
import logo from "./logo.png";

interface OrderProps {
  value: number;
  title: string;
}

export function Order({ value, title }: OrderProps) {
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
          className="text-4xl font-bold -tracking-widest text-[#0f2f76] dark:text-white md:text-7xl md:leading-[5rem]"
          word={title}
        />
      </p>
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
        <p className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-[#0f2f76] dark:text-white">
          <NumberTicker value={value} />
        </p>
        <Ripple />
      </div>
    </div>
  );
}
