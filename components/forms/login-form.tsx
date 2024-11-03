"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
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

const loginSchema = z.object({
  userId: z
    .string()
    .length(10, { message: "ID must be exactly 10 digits." })
    .regex(/^\d+$/, { message: "ID must contain only digits." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [submitStatus, setSubmitStatus] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  function onSubmit(values: LoginSchema) {
    console.log(values);
    setSubmitStatus(true);
  }

  return (
    <NeonGradientCard
      neonColors={{ firstColor: "#0f2f76", secondColor: "#81d4fa" }}
      className="max-w-md items-center justify-center text-center space-y-6"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel className="text-[#0f2f76]">User ID</FormLabel>
                <FormControl>
                  <input
                    type="text"
                    placeholder="1234567890"
                    className="w-full p-2 border border-gray-300 rounded-md text-center"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel className="text-[#0f2f76]">Password</FormLabel>
                <FormControl>
                  <input
                    type="password"
                    placeholder="********"
                    className="w-full p-2 border border-gray-300 rounded-md text-center"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
                    Sign In
                  <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              }
              changeText={
                <span className="group inline-flex items-center">
                  <CheckIcon className="mr-2 size-4" />
                    Success
                </span>
              }
            />
          </div>
        </form>
      </Form>
    </NeonGradientCard>
  );
}
