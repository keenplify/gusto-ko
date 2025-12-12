"use server";

import prisma from "@/lib/prisma";
import { WishlistItem } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

export async function upsertWishlistItemByShareId(
  shareId: string,
  item: Partial<WishlistItem>
) {
  const wishlist = await prisma.wishlist.findFirst({
    where: {
      shareId,
    },
  });

  if (!wishlist) {
    return {
      success: false,
      reason: "Invalid wishlist",
    };
  }

  try {
    if (item.id) {
      const wishlistItem = await prisma.wishlistItem.upsert({
        where: {
          id: item.id,
        },
        create: {
          ...(item as WishlistItem),
          wishlistId: wishlist.id,
        },
        update: item,
      });

      return {
        success: true,
        reason: "Item updated successfully",
        wishlistItem,
      };
    } else {
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          ...item,
          name: item.name ?? "Wishlist Item",
          wishlistId: wishlist.id,
        },
      });

      return {
        success: true,
        reason: "Item updated successfully",
        wishlistItem,
      };
    }
  } catch (error) {
    console.error(error);
    if (error instanceof PrismaClientKnownRequestError) {
      return {
        success: false,
        reason: `Unable to add wishlist item. Code ${error.code}`,
      };
    } else {
      return {
        success: false,
        reason: "Unable to add wishlist item",
      };
    }
  }
}

export async function deleteWishlistItem(id: string, path?: string) {
  await prisma.wishlistItem.delete({
    where: {
      id,
    },
  });

  if (path) {
    revalidatePath(path, "layout");
  }

  return {
    success: true,
  };
}
