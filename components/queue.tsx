"use client";

import * as React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Medicine {
  name: string;
  quantity: number;
  dosage: string;
}

interface Prescription {
  id: number;
  patientName: string;
  medicines: Medicine[];
}

const prescriptions: Prescription[] = [
  {
    id: 1,
    patientName: "John Doe",
    medicines: [
      { name: "Amoxicillin", quantity: 2, dosage: "500mg" },
      { name: "Ibuprofen", quantity: 1, dosage: "200mg" },
      { name: "Diazepam", quantity: 1, dosage: "5mg" },
      { name: "Cetirizine", quantity: 1, dosage: "10mg" },
      { name: "Lorazepam", quantity: 1, dosage: "1mg" },
      { name: "Omeprazole", quantity: 1, dosage: "20mg" },
    ],
  },
  {
    id: 2,
    patientName: "Jane Smith",
    medicines: [{ name: "Paracetamol", quantity: 3, dosage: "500mg" }],
  },
  {
    id: 3,
    patientName: "Alice Johnson",
    medicines: [
      { name: "Aspirin", quantity: 1, dosage: "100mg" },
      { name: "Omeprazole", quantity: 1, dosage: "20mg" },
    ],
  },
  {
    id: 4,
    patientName: "Bob Brown",
    medicines: [{ name: "Loratadine", quantity: 1, dosage: "10mg" }],
  },
  {
    id: 5,
    patientName: "Charlie White",
    medicines: [{ name: "Loratadine", quantity: 2, dosage: "10mg" }],
  },
];

export function Queue() {
  const [status, setStatus] = useState<{
    [key: number]: "inProgress" | "ready" | null;
  }>({});

  const handleMarkInProgress = (id: number) => {
    setStatus((prev) => ({ ...prev, [id]: "inProgress" }));
  };

  const handleMarkReady = (id: number) => {
    setStatus((prev) => ({ ...prev, [id]: "ready" }));
  };

  return (
    <Carousel className="w-full max-w-5xl">
      <CarouselContent className="-ml-1">
        {prescriptions.map((prescription) => (
          <CarouselItem
            key={prescription.id}
            className="pl-1 md:basis-1/2 lg:basis-1/3"
          >
            <Card className="p-4 h-96 w-80 text-[#0f2f76]">
              <CardHeader>
                <CardTitle>Queue Position: {prescription.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold">
                  Patient: {prescription.patientName}
                </p>

                <ScrollArea className="h-48 my-2">
                  <div className="p-2">
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="text-sm mb-2">
                        <span className="font-medium text-[#81d4fa]">
                          {medicine.name}
                        </span>{" "}
                        - {medicine.quantity} units, {medicine.dosage}
                        {index < prescription.medicines.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                {status[prescription.id] !== "inProgress" && (
                  <Button onClick={() => handleMarkInProgress(prescription.id)}>
                    Mark as In Progress
                  </Button>
                )}
                {status[prescription.id] === "inProgress" && (
                  <Button
                    onClick={() => handleMarkReady(prescription.id)}
                    variant="secondary"
                  >
                    Mark as Ready
                  </Button>
                )}
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
