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
import { useTicketDispenser } from "@/lib/use-ticket-dispenser";

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
  const ticketDispenser = useTicketDispenser();

  const { publishPrescription } = useSocket((prescription: any) => {
    // Handle prescription updates if needed
    console.log('Prescription updated:', prescription);
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      prescriptionNumber: "",
    },
  });

  async function onSubmit(values: FormSchema) {
    try {
      setError(null);
      
      // Get severity from prescription
      const prescriptionResponse = await api.prescriptions.get(values.prescriptionNumber);
      const severityImpact = prescriptionResponse.data.severityImpact || 1;
      
      // Get ticket from dispenser
      const ticket = await ticketDispenser.issueTicket(severityImpact);
      setTicketNumber(ticket.number);

      publishPrescription({
        prescriptionId: values.prescriptionNumber,
        patientId: values.patientId,
        doctorId: "SYSTEM", // Default system ID since we're not verifying
        medicines: [], // Empty medicines array since we're not verifying
        status: "processing",
        ticketNumber: ticket.number,
        timestamp: new Date().toISOString(),
        severityImpact
      });

      setSubmitStatus(true);
    } catch (error: any) {
      setError("An error occurred while processing your request");
      console.error(error);
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
