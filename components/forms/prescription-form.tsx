"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { QueueEntry } from "@/lib/types/api-types";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { NeonGradientCard } from "../ui/neon-gradient-card";
import { Input } from "../ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { AnimatedSubscribeButton } from "../ui/animated-subscribe-button";
import { ChevronRightIcon } from "lucide-react";
import { api } from "@/lib/services/external-api";
import { useSocket } from "@/lib/use-socket";

const formSchema = z.object({
  doctorId: z.string().default("1"),
  patientId: z.string().min(1, "Patient ID is required."),
  prescriptionId: z.string(),
  severityImpact: z.number().min(0).max(9),
  medicines: z
    .array(
      z.object({
        name: z.string().min(1, "Medicine name is required."),
        quantity: z.string().min(1, "Quantity must be at least 1."),
        dosage: z.string().min(1, "Dosage is required."),
      })
    )
    .min(1, "At least one medicine is required."),
});

type FormSchema = z.infer<typeof formSchema>;

export default function PrescriptionForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState(false);
  const [prescriptionNumber, setPrescriptionNumber] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<
    Array<{ name: string; stock_quantity: string }>
  >([]);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  // const socket = useSocket();

  const { publishQueueUpdate } = useSocket((update) => {
    console.log("Queue update:", update);
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: "1",
      patientId: "",
      prescriptionId: "",
      severityImpact: 1,
      medicines: [{ name: "", quantity: "1", dosage: "" }],
    },
  });

  useEffect(() => {
    // Generate a random prescription ID: Letter followed by 6 digits
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const prescriptionId = `${letter}${numbers}`;
    form.setValue("prescriptionId", prescriptionId);
    console.log("New prescription ID:", prescriptionId);

    // Fetch medicines from API
    const fetchMedicines = async () => {
      try {
        const response = await api.medicines.getStock();
        setMedicines(response.data.map((m) => ({ 
          name: m.name, 
          stock_quantity: m.stock_quantity.toString() 
        })));
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, [form]);

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setError(null);
      
      // Create prescription first
      const prescriptionResponse = await api.prescriptions.create({
        doctorId: data.doctorId,
        patientId: data.patientId,
        severityImpact: data.severityImpact
      });
      
      // Generate ticket number using severity impact
      const ticketNumber = `${data.severityImpact}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      // Add to queue
      const queueEntry: Omit<QueueEntry, 'id'> = {
        queueNumber: ticketNumber,
        prescription_id: prescriptionResponse.id,
        patient_id: data.patientId,
        medicines: data.medicines,
        wait_time: '0',
        served_time: '',
        entry_time: new Date().toISOString(),
        severity_impact: data.severityImpact,
        status: 'processing'
      };
      
      await api.queue.addToQueue(queueEntry);
      
      setTicketNumber(ticketNumber);
      setShowTicket(true);
      
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error creating prescription:', error);
    }
  };

  return (
    <NeonGradientCard
      neonColors={{ firstColor: "#0f2f76", secondColor: "#81d4fa" }}
      className="max-w-md items-center justify-center text-center space-y-6"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 text-[#0f2f76]"
        >
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel>Patient ID</FormLabel>
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
            name="severityImpact"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Severity Impact (0-9)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={9}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              <FormField
                control={form.control}
                name={`medicines.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Name</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full"
                          >
                            {field.value || "Select medicine"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search medicine..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No medicine found.</CommandEmpty>
                            <CommandGroup>
                              {medicines.map((medicine) => (
                                <CommandItem
                                  key={medicine.name}
                                  onSelect={() =>
                                    form.setValue(
                                      `medicines.${index}.name`,
                                      medicine.name
                                    )
                                  }
                                >
                                  {medicine.name} (Stock:{" "}
                                  {medicine.stock_quantity})
                                  {medicine.name === field.value && (
                                    <CheckIcon className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`medicines.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`medicines.${index}.dosage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter dosage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            className="bg-[#0f2f76]"
            onClick={() => append({ name: "", quantity: "1", dosage: "" })}
          >
            Add Medicine
          </Button>
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
          {submitStatus && prescriptionNumber && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <h3 className="text-lg font-semibold text-green-800">Prescription Created Successfully!</h3>
              <p className="text-green-700">
                Prescription Number: <span className="font-mono font-bold">{prescriptionNumber}</span>
              </p>
              <p className="text-sm text-green-600 mt-2">
                Please provide this number to the patient. They will need it to get their medicine.
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </form>
      </Form>
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Submitted</DialogTitle>
            <DialogDescription>
              Your prescription has been added to the queue. Your ticket number is:
              <div className="text-3xl font-bold text-center mt-4 mb-4">
                {ticketNumber}
              </div>
              Please wait for your number to be called on the central screen.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowTicket(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </NeonGradientCard>
  );
}
