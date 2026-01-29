"use client";

import { updateUser } from "@/app/actions/user";
import { useForm } from "@tanstack/react-form";
import { useRef, useEffect } from "react";
import { toast } from "sonner";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import "react-day-picker/style.css";

// Required for advanced date manipulation
dayjs.extend(relativeTime);

export default function SetupBirthdateModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const form = useForm({
    defaultValues: {
      birthdate: new Date(),
    },
    onSubmit: async ({ value }) => {
      const res = await updateUser({
        birthdate: value.birthdate as Date | null,
      });

      if (!res.success) {
        toast.error(res.reason);
        return;
      }

      toast.success("Birthdate updated successfully");
      dialogRef.current?.close();
    },
  });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Logic to calculate the "next" occurrence of the birthday
  const getBirthdayStatus = (date: Date) => {
    const today = dayjs().startOf("day");
    const birthday = dayjs(date).startOf("day");

    // Create a date for this year's celebration
    let nextBirthday = birthday.year(today.year());

    // If it already passed this year, look at next year
    if (nextBirthday.isBefore(today)) {
      nextBirthday = nextBirthday.add(1, "year");
    }

    const daysUntil = nextBirthday.diff(today, "day");

    if (daysUntil === 0) {
      return (
        <span className="text-xl font-bold animate-bounce block text-secondary">
          🎉 HAPPY BIRTHDAY! IT&apos;S YOUR DAY! 🎂
        </span>
      );
    }

    if (daysUntil <= 7) {
      return (
        <span className="text-lg font-extrabold text-primary uppercase tracking-tighter">
          🚨 ONLY {daysUntil} {daysUntil === 1 ? "DAY" : "DAYS"} LEFT!! GET THE
          🎂 READY!! 🚨
        </span>
      );
    }

    return (
      <span className="text-base-content/80">
        Only <strong>{daysUntil}</strong> days to go until your birthday!
      </span>
    );
  };

  return (
    <>
      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box flex flex-col gap-4 text-center">
          <h3 className="font-bold text-2xl">When&apos;s the party? 🎂</h3>

          <p className="text-sm text-base-content/70">
            Adding your birthdate allows friends and family to find your
            wishlist easily.
          </p>

          <form.Field name="birthdate">
            {(field) => (
              <div className="flex justify-center min-h-[350px] react-day-picker bg-base-200 rounded-xl p-2">
                <DayPicker
                  mode="single"
                  selected={field.state.value}
                  onSelect={(date) => (date ? field.handleChange(date) : null)}
                  required
                  captionLayout="dropdown"
                  disabled={{ after: new Date() }}
                />
              </div>
            )}
          </form.Field>

          <form.Subscribe>
            {({ isSubmitting, values }) => (
              <div className="space-y-4">
                <div className="min-h-8">
                  {values.birthdate && getBirthdayStatus(values.birthdate)}
                </div>

                <button
                  className="btn btn-success w-full text-lg"
                  disabled={isSubmitting}
                  onClick={form.handleSubmit}
                >
                  Save My Birthday
                </button>

                <form method="dialog" className="flex flex-col">
                  <button
                    className="btn btn-ghost btn-sm w-full"
                    disabled={isSubmitting}
                  >
                    Setup Later
                  </button>
                </form>
              </div>
            )}
          </form.Subscribe>
        </div>
      </dialog>
    </>
  );
}
