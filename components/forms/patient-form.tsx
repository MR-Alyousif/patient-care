"use client";

import * as React from "react";
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
import type { QueueEntry } from "@/lib/types/api-types";

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
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { publishQueueUpdate } = useSocket((update) => {
    console.log("Queue update:", update);
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      prescriptionNumber: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      setError(null);
      const prescriptionResponse = await api.prescriptions.get(data.prescriptionNumber);
      
      // Generate ticket number based on severity
      const severity = prescriptionResponse.data.severityImpact || 5; // Default to medium priority
      const ticketNum = `${severity}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      // Create queue entry
      const queueEntry: Omit<QueueEntry, 'id'> = {
        queueNumber: ticketNum,
        prescription_id: data.prescriptionNumber,
        patient_id: data.patientId,
        medicines: prescriptionResponse.data.medicines || [],
        wait_time: '0',
        served_time: '',
        entry_time: new Date().toISOString(),
        status: 'processing',
        severity_impact: severity
      };

      await api.queue.addToQueue(queueEntry);
      setTicketNumber(ticketNum);
      setSubmitStatus(true);
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      setSubmitStatus(false);
    }
  };

  return (
    <NeonGradientCard
      title="Submit Prescription"
      description="Enter your patient ID and prescription number"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient ID</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={10}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <React.Fragment key={i}>
                          <InputOTPSlot index={i} />
                          {i !== 9 && <InputOTPSeparator />}
                        </React.Fragment>
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
              <FormItem>
                <FormLabel>Prescription Number</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={7}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 7 }).map((_, i) => (
                        <React.Fragment key={i}>
                          <InputOTPSlot index={i} />
                          {i !== 6 && <InputOTPSeparator />}
                        </React.Fragment>
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          <div className="flex flex-col items-center space-y-4">
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

            {submitStatus && ticketNumber && (
              <div className="mt-4">
                <Order
                  value={ticketNumber}
                  status="processing"
                  severity={parseInt(ticketNumber[0])}
                />
              </div>
            )}
          </div>
        </form>
      </Form>
    </NeonGradientCard>
  );
}
