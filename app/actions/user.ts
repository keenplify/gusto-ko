"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

/**
 * Update the authenticated user's GCash QR URL
 * @param gcashQRUrl The URL of the uploaded GCash QR code
 * @returns Success status and optional reason for failure
 */
export async function updateUserGCashQRUrl(gcashQRUrl: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        reason: "User not authenticated",
      };
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { gcashQRUrl },
    });

    revalidatePath("/");

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error updating GCash QR URL:", error);
    return {
      success: false,
      reason: "Failed to update GCash QR URL",
    };
  }
}

/**
 * Remove the authenticated user's GCash QR URL
 * @returns Success status and optional reason for failure
 */
export async function removeUserGCashQRUrl() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        reason: "User not authenticated",
      };
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { gcashQRUrl: null },
    });

    revalidatePath("/");

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error removing GCash QR URL:", error);
    return {
      success: false,
      reason: "Failed to remove GCash QR URL",
    };
  }
}

/**
 * Update current user
 */
export async function updateUser(user: Partial<User>) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        reason: "User not authenticated",
      };
    }
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: user,
    });

    revalidatePath("/");
    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      reason: "Failed to update user",
    };
  }
}
