"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ddsConnector, type Prescription } from "@/lib/dds-connector";

export function Queue() {
  const [prescriptions, setPrescriptions] = useState<
    Record<string, Prescription>
  >({});

  // Subscribe to prescription updates
  useEffect(() => {
    const timer = ddsConnector.startSubscription((prescription) => {
      setPrescriptions((prev) => ({
        ...prev,
        [prescription.prescriptionId]: prescription,
      }));
    });

    return () => ddsConnector.stopSubscription(timer);
  }, []);

  const handleComplete = async (prescriptionId: string) => {
    const prescription = prescriptions[prescriptionId];
    if (prescription && prescription.status === "processing") {
      const updatedPrescription = {
        ...prescription,
        status: "ready",
        timestamp: new Date().toISOString(),
      };

      try {
        // Publish updated prescription to DDS
        await ddsConnector.publishPrescription(updatedPrescription);

        // Update localStorage for backup
        const storedPrescriptions = JSON.parse(
          localStorage.getItem("prescriptions") || "{}"
        );
        storedPrescriptions[prescriptionId] = updatedPrescription;
        localStorage.setItem(
          "prescriptions",
          JSON.stringify(storedPrescriptions)
        );
      } catch (error) {
        console.error("Error updating prescription status:", error);
      }
    }
  };

  const processingPrescriptions = Object.entries(prescriptions)
    .filter(([, prescription]) => prescription.status === "processing")
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
            <p className="text-center text-gray-500">
              No prescriptions in queue
            </p>
          ) : (
            <Carousel>
              <CarouselContent>
                {processingPrescriptions.map((prescription) => (
                  <CarouselItem
                    key={prescription.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
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
