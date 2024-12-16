"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// import type { Prescription } from "@/lib/types/dds-types";
import { useSocket } from "@/lib/use-socket";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
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

const formSchema = z.object({
  doctorId: z.string().default("defaultDoctorId"),
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

// const medicinesList = [
//   { label: "Paracetamol", value: "paracetamol" },
//   { label: "Ibuprofen", value: "ibuprofen" },
//   { label: "Amoxicillin", value: "amoxicillin" },
//   { label: "Metformin", value: "metformin" },
//   { label: "Aspirin", value: "aspirin" },
//   { label: "Atorvastatin", value: "atorvastatin" },
//   { label: "Amlodipine", value: "amlodipine" },
//   { label: "Omeprazole", value: "omeprazole" },
//   { label: "Simvastatin", value: "simvastatin" },
//   { label: "Losartan", value: "losartan" },
//   { label: "Lisinopril", value: "lisinopril" },
//   { label: "Levothyroxine", value: "levothyroxine" },
//   { label: "Azithromycin", value: "azithromycin" },
//   { label: "Gabapentin", value: "gabapentin" },
//   { label: "Hydrochlorothiazide", value: "hydrochlorothiazide" },
//   { label: "Furosemide", value: "furosemide" },
//   { label: "Metoprolol", value: "metoprolol" },
//   { label: "Pantoprazole", value: "pantoprazole" },
//   { label: "Prednisone", value: "prednisone" },
//   { label: "Clopidogrel", value: "clopidogrel" },
// ];

export function PrescriptionForm() {
  const [submitStatus, setSubmitStatus] = useState(false);
  const [, setPrescriptionId] = useState("");
  const [medicines, setMedicines] = useState<
    Array<{ name: string; stock_quantity: string }>
  >([]);
  const [, setError] = useState<string | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: "defaultDoctorId",
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
    setPrescriptionId(prescriptionId);
    form.setValue("prescriptionId", prescriptionId);
    console.log("New prescription ID:", prescriptionId);

    // Fetch medicines from API
    const fetchMedicines = async () => {
      try {
        const response = await fetch(
          "https://patient-care-api.vercel.app/api/medicines/check-stock"
        );
        const data = await response.json();
        setMedicines(data);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, [form]);

  const { publishPrescription } = useSocket((prescription) => {
    console.log("Prescription update:", prescription);
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  async function onSubmit(values: FormSchema) {
    try {
      setError(null);
      
      // Publish to DDS for real-time updates
      if (publishPrescription) {
        publishPrescription({
          ...values,
          prescriptionId: values.prescriptionId,
          status: "pending",
          ticketNumber: null,
          timestamp: new Date().toISOString(),
        });
      }

      setSubmitStatus(true);
      setTimeout(() => {
        form.reset();
        setSubmitStatus(false);
      }, 2000);
    } catch (err) {
      console.error("Error creating prescription:", err);
      setError("Failed to create prescription");
      setSubmitStatus(false);
    }
  }

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
        </form>
      </Form>
    </NeonGradientCard>
  );
}
