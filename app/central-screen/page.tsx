"use client";
import { Order } from "@/components/order";
import { useState, useEffect } from "react";

export default function CentralScreen() {
  const [currentNumber, setCurrentNumber] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    setCurrentNumber(1);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Order value={currentNumber || 0} title={"Now Serving"} />
    </main>
  );
}
