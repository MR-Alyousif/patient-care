"use client";
import { Order } from "@/components/order";
import { useState } from "react";

export default function CentralScreen() {
  const [currentNumber, setCurrentNumber] = useState(0);

  setCurrentNumber(1);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Order value={currentNumber} title={"Now Serving"} />
    </main>
  );
}
