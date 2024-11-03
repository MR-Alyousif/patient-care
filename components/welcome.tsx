"use client";

import BlurFade from "./ui/blur-fade";
import GradualSpacing from "./ui/gradual-spacing";
import Image from "next/image";
import logo from "./logo.png";

interface WelcomeProps {
  primaryText: string;
  secondaryText: string;
}

export default function Welcome({ primaryText, secondaryText }: WelcomeProps) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-4 space-y-4 text-center">
      <BlurFade duration={0.6} yOffset={10} blur="10px">
        <Image
          src={logo}
          alt="Logo"
          className="w-24 h-24 md:w-32 md:h-32 mb-4"
        />
      </BlurFade>

      <GradualSpacing
        text={primaryText}
        duration={0.6}
        delayMultiple={0.05}
        className="text-2xl md:text-3xl font-semibold text-[#0f2f76]"
      />

      <GradualSpacing
        text={secondaryText}
        duration={0.6}
        delayMultiple={0.05}
        className="text-lg md:text-xl font-light text-[#81d4fa] mt-2"
      />
    </div>
  );
}
