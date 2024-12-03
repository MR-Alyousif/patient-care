"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Medicine {
  name: string;
  quantity: string;
  dosage: string;
}

interface Prescription {
  prescriptionId: string;
  patientId: string;
  medicines: Medicine[];
  status: string;
  ticketNumber: number | null;
}

export function Queue() {
  const [prescriptions, setPrescriptions] = useState<Record<string, Prescription>>({});

  // Load prescriptions from localStorage
  React.useEffect(() => {
    const loadPrescriptions = () => {
      const storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "{}");
      setPrescriptions(storedPrescriptions);
    };

    loadPrescriptions();
    // Set up an interval to check for new prescriptions
    const interval = setInterval(loadPrescriptions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = (prescriptionId: string) => {
    const updatedPrescriptions = { ...prescriptions };
    const prescription = updatedPrescriptions[prescriptionId];
    if (prescription && prescription.status === "processing") {
      prescription.status = "ready";
      localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions));
      setPrescriptions(updatedPrescriptions);
    }
  };

  const processingPrescriptions = Object.entries(prescriptions)
    .filter(([_, prescription]) => prescription.status === "processing")
    .map(([id, prescription]) => ({ id, ...prescription }));

  return (
    <div className="w-full max-w-4xl px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#0f2f76]">
            Processing Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processingPrescriptions.length === 0 ? (
            <p className="text-center text-gray-500">No prescriptions in queue</p>
          ) : (
            <Carousel>
              <CarouselContent>
                {processingPrescriptions.map((prescription) => (
                  <CarouselItem key={prescription.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Ticket #{prescription.ticketNumber}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px] rounded-md border p-4">
                          {prescription.medicines.map((medicine, index) => (
                            <div key={index}>
                              <div className="text-sm">
                                <p className="font-medium">{medicine.name}</p>
                                <p className="text-gray-500">
                                  Quantity: {medicine.quantity}
                                </p>
                                <p className="text-gray-500">
                                  Dosage: {medicine.dosage}
                                </p>
                              </div>
                              {index < prescription.medicines.length - 1 && (
                                <Separator className="my-2" />
                              )}
                            </div>
                          ))}
                        </ScrollArea>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button
                          onClick={() => handleComplete(prescription.id)}
                          className="bg-[#0f2f76] text-white hover:bg-[#1a4ba5]"
                        >
                          Mark as Ready
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
