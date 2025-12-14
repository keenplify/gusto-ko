"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function reserveItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const nickname = formData.get("nickname") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const amount = formData.get("amount") as string;
  const userId = formData.get("userId") as string;

  const cookieStore = await cookies();
  let sessionId = cookieStore.get("wishlist_guest_id")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("wishlist_guest_id", sessionId);
  }

  // 1. Handle Amount:
  // If your Client component sends "10000" (cents), just parse it.
  // We default to 0 if amount is missing.
  const finalAmount = amount ? Number.parseInt(amount) : 0;

  try {
    await prisma.reservation.create({
      data: {
        giver_session_id: sessionId,
        giver_nickname: nickname,
        giver_email: email,
        giver_message: message,
        giver_amount: finalAmount,
        is_purchased: true,
        item:
          itemId && itemId !== "undefined" && itemId.trim() !== ""
            ? {
                connect: {
                  id: itemId,
                },
              }
            : {},

        user: userId
          ? {
              connect: {
                id: userId,
              },
            }
          : {},
      },
    });

    revalidatePath(`/wishlist`);
    return { success: true };
  } catch (error) {
    console.error("Reservation error:", error);
    // Return the specific error message to help debugging
    return { success: false, error: "Failed to reserve item" };
  }
}
