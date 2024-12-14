"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedSubscribeButton } from "../ui/animated-subscribe-button";
import { NeonGradientCard } from "../ui/neon-gradient-card";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { Order } from "../order";
import { useSocket } from "@/lib/use-socket";
import { api } from "@/lib/services/external-api";
import type { Prescription } from "@/lib/types/dds-types";

const formSchema = z.object({
  patientId: z
    .string()
    .length(10, { message: "Patient ID must be exactly 10 digits." })
    .regex(/^\d+$/, { message: "Patient ID must contain only digits." }),
  prescriptionNumber: z.string().regex(/^[A-Za-z]\d{6}$/, {
    message:
      "Prescription number must start with a letter followed by 6 digits.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

export function PatientForm() {
  const [submitStatus, setSubmitStatus] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<
    Record<string, Prescription>
  >({});
  const [lastSequentialNumbers, setLastSequentialNumbers] = useState<{ [key: number]: number }>({}); // Track last number for each severity

  const { publishPrescription } = useSocket((prescription) => {
    setPrescriptions((prev) => ({
      ...prev,
      [prescription.prescriptionId]: prescription,
    }));
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      prescriptionNumber: "",
    },
  });

  const generateTicketNumber = (severityImpact: number): number => {
    // Get the last sequential number for this severity level or start at 0
    const lastNumber = lastSequentialNumbers[severityImpact] || 0;
    // Increment the sequential number
    const newSequential = (lastNumber + 1) % 100; // Keep it 2 digits
    // Update the last number for this severity
    setLastSequentialNumbers((prev) => ({ ...prev, [severityImpact]: newSequential }));
    // Combine severity (first digit) with sequential number (last 2 digits)
    return severityImpact * 100 + newSequential;
  };

  async function onSubmit(values: FormSchema) {
    try {
      setError(null);
      const { valid, prescription } = await api.patients.verify(
        values.patientId,
        values.prescriptionNumber
      );

      if (!valid || !prescription) {
        setError("Invalid patient ID or prescription number");
        return;
      }

      const ticketNumber = generateTicketNumber(prescription.severityImpact);
      setTicketNumber(ticketNumber);
      
      // Add to queue via API
      await api.queue.add({
        queueNumber: ticketNumber,
        prescriptionId: prescription.prescriptionId,
        patientId: prescription.patientId,
        medicines: prescription.medicines.map(m => m.name).join(", "),
        waitTime: "00:10:00", // Default wait time
        servedTime: "00:05:00", // Default service time
        entryTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      });

      // Then publish to DDS for real-time updates
      if (publishPrescription) {
        publishPrescription({
          ...prescription,
          ticketNumber,
          status: 'processing',
          timestamp: new Date().toISOString(),
        });
      }

      setSubmitStatus(true);
    } catch (err) {
      setError("Failed to verify patient information");
      setSubmitStatus(false);
    }
  }

  return (
    <div>
      {!submitStatus && (
        <NeonGradientCard
          neonColors={{ firstColor: "#0f2f76", secondColor: "#81d4fa" }}
          className="max-w-md items-center justify-center text-center space-y-6"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-[#0f2f76]">Patient ID</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={10} {...field}>
                        <InputOTPGroup>
                          {Array.from({ length: 10 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prescriptionNumber"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-[#0f2f76]">
                      Prescription Number
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={7} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index + 1} index={index + 1} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                    {error && (
                      <p className="text-sm font-medium text-red-500 mt-2">
                        {error}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <div className="flex justify-center w-full">
                <AnimatedSubscribeButton
                  buttonColor="#0f2f76"
                  buttonTextColor="#ffffff"
                  subscribeStatus={submitStatus}
                  initialText={
                    <span className="group inline-flex items-center">
                      Submit
                      <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  }
                  changeText={
                    <span className="group inline-flex items-center">
                      <CheckIcon className="mr-2 size-4" />
                      Submitted
                    </span>
                  }
                />
              </div>
            </form>
          </Form>
        </NeonGradientCard>
      )}
      {submitStatus && ticketNumber && (
        <Order value={ticketNumber} title={"Your ticket number is"} />
      )}
    </div>
  );
}
