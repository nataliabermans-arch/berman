"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

import CheckChip from "@/components/atoms/CheckChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ContactFormProps {
  className?: string;
}

const contactMethods = ["phone", "email", "text"] as const;

const formSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(7, "Please enter a phone number."),
  reason: z.enum([
    "hormone therapy",
    "sexual health",
    "weight loss",
    "peptides",
    "aesthetic",
    "other",
  ]),
  contactMethods: z
    .array(z.enum(contactMethods))
    .min(1, "Choose a contact method."),
  message: z.string().min(10, "Please include a short message."),
  consent: z.boolean().refine((value) => value, {
    message: "HIPAA acknowledgement is required.",
  }),
});

type ContactFormValues = z.infer<typeof formSchema>;

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  reason: "hormone therapy",
  contactMethods: ["phone"],
  message: "",
  consent: true,
};

/**
 * Appointment request form with local validation and placeholder submit handling.
 * The submit destination is intentionally deferred to a later integration phase.
 */
export function ContactForm({ className }: ContactFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: ContactFormValues) {
    console.log("Contact form submission pending integration", values);
  }

  return (
    <form
      action="#"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      className={cn(
        "rounded-lg border border-line bg-white p-6 shadow-card md:p-10",
        className,
      )}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field error={errors.name?.message}>
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            className="mt-2 h-12 border-line bg-neutral-50 px-4"
            {...register("name")}
          />
        </Field>

        <Field error={errors.email?.message}>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            className="mt-2 h-12 border-line bg-neutral-50 px-4"
            {...register("email")}
          />
        </Field>

        <Field error={errors.phone?.message}>
          <Label htmlFor="contact-phone">Phone</Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            className="mt-2 h-12 border-line bg-neutral-50 px-4"
            {...register("phone")}
          />
        </Field>

        <Field error={errors.reason?.message}>
          <Label htmlFor="contact-reason">Reason for visit</Label>
          <Controller
            control={control}
            name="reason"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger
                  id="contact-reason"
                  className="mt-2 h-12 w-full border-line bg-neutral-50 px-4"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formSchema.shape.reason.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field className="mt-6" error={errors.contactMethods?.message}>
        <Label>Preferred contact method</Label>
        <Controller
          control={control}
          name="contactMethods"
          render={({ field }) => (
            <div className="mt-3 flex flex-wrap gap-2">
              {contactMethods.map((method) => {
                const checked = field.value.includes(method);

                return (
                  <CheckChip
                    key={method}
                    checked={checked}
                    onClick={() => {
                      field.onChange(
                        checked
                          ? field.value.filter((value) => value !== method)
                          : [...field.value, method],
                      );
                    }}
                  >
                    {method}
                  </CheckChip>
                );
              })}
            </div>
          )}
        />
      </Field>

      <Field className="mt-6" error={errors.message?.message}>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={6}
          className="mt-2 min-h-36 border-line bg-neutral-50 px-4 py-3"
          {...register("message")}
        />
      </Field>

      <Field className="mt-6" error={errors.consent?.message}>
        <label className="flex items-start gap-3 font-inter text-sm leading-6 text-text-secondary">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-line accent-rose-700"
            {...register("consent")}
          />
          <span>
            I understand this form is for appointment requests and does not
            establish a provider-patient relationship or transmit urgent medical
            information.
          </span>
        </label>
      </Field>

      <Button
        type="submit"
        className="mt-8 h-12 rounded-full border-ink bg-ink-aurora px-7 font-dm-mono text-[0.7rem] uppercase tracking-[0.2em] text-white hover:shadow-lift-rose"
      >
        Request appointment
      </Button>
    </form>
  );
}

interface FieldProps {
  children: ReactNode;
  error?: string;
  className?: string;
}

function Field({ children, error, className }: FieldProps) {
  return (
    <div className={className}>
      {children}
      {error ? (
        <p className="mt-2 font-inter text-xs leading-5 text-danger">{error}</p>
      ) : null}
    </div>
  );
}

export default ContactForm;
