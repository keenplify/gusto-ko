"use client";

import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function OnboardingSteps() {
  const pathname = usePathname();
  return (
    <ul className="steps">
      <li
        className={`step ${pathname.includes("/onboarding") ? "step-primary" : ""}`}
      >
        <span
          className={twMerge(
            "text-3xl w-32 text-center",
            pathname !== "/onboarding" && "opacity-50",
          )}
        >
          👋
        </span>
      </li>
      <li
        className={`step ${pathname.includes("/onboarding/create-wishlist") ? "step-primary" : ""}`}
      >
        <span
          className={twMerge(
            "text-3xl w-32 text-center",
            pathname !== "/onboarding/create-wishlist" && "opacity-50",
          )}
        >
          📝
        </span>
      </li>
      <li
        className={`step ${pathname.includes("/onboarding/preview") ? "step-primary" : ""}`}
      >
        <span
          className={twMerge(
            "text-3xl w-32 text-center",
            pathname !== "/onboarding/preview" && "opacity-50",
          )}
        >
          👀
        </span>
      </li>
    </ul>
  );
}
