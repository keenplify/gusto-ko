import { auth } from "@/auth";
import WishlistItemCard from "@/components/cards/wishlist-item";
import prisma from "@/lib/prisma";
import { WishlistItem } from "@prisma/client";
import { Frown, Gift } from "lucide-react";
import Image from "next/image";

type WishlistItemsProps = ({ shareId: string } | { wishlistId: string }) & {
  expanded?: boolean;
};

export default async function WishlistItems(props: WishlistItemsProps) {
  const wishlist = await prisma.wishlist.findUnique({
    where:
      "shareId" in props
        ? { shareId: props.shareId }
        : { id: props.wishlistId },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
      },
      user: {
        select: {
          image: true,
          name: true,
          gcashQRUrl: true,
        },
      },
    },
  });

  if (!wishlist) {
    return (
      <div className="p-4 text-center text-sm opacity-60">
        <Frown /> Cannot find wishlist.
      </div>
    );
  }

  const session = await auth();

  const isOwnWishlist = wishlist.userId === session?.user?.id;

  return (
    <div className="bg-base-100 rounded-box shadow-md w-full p-4 grow gap-2 flex flex-col h-full min-h-0">
      <div className="text-center text-lg font-bold flex gap-4 justify-center items-center">
        {wishlist.user.image ? (
          <div className="avatar rounded-full">
            <Image
              src={wishlist.user.image}
              className="w-12 rounded-full"
              alt="User avatar"
              width={48}
              height={48}
            />
          </div>
        ) : (
          <div className="avatar avatar-placeholder w-12">
            <div className="bg-neutral text-neutral-content w-12 rounded-full">
              <span>{wishlist.user.name?.[0] || <Gift />}</span>
            </div>
          </div>
        )}

        <span>{wishlist.name || `${wishlist.user.name} Wishlist`}</span>
      </div>
      <div className="overflow-y-auto grow flex flex-col gap-2 min-h-0">
        {wishlist.items.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item as WishlistItem}
            isOwnWishlist={isOwnWishlist}
            path="/wishlists/[id]"
            expanded={props.expanded}
            wishlistOwner={wishlist.user}
          />
        ))}
        {wishlist.items.length === 0 && (
          <div className="flex justify-center py-4">
            {isOwnWishlist ? (
              <span>Start curating your own wishlist!</span>
            ) : (
              <span>This wishlist is blank.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
