import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Gift, MessageSquareQuote, Wallet } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Optional: for "2 hours ago"
import Image from "next/image";

interface WishlistReservationsProps {
  userId: string;
}

export default async function WishlistReservations({
  userId,
}: WishlistReservationsProps) {
  const session = await auth();
  const isSelf = session?.user?.id === userId;

  // 1. Security: Only the owner should see their own reservations
  if (!isSelf) {
    return null;
  }

  // 2. Fetch Reservations
  // We find reservations where the connected Item belongs to a Wishlist owned by this User.
  const reservations = await prisma.reservation.findMany({
    where: {
      item: {
        wishlist: {
          userId: userId,
        },
      },
    },
    include: {
      item: true,
    },
    orderBy: {
      reserved_at: "desc",
    },
  });

  const formatCurrency = (amount: number | string | null) => {
    if (!amount) return "";
    const val = Number(amount) / 100; // Assuming stored in cents
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);
  };

  return (
    <ul className="list bg-base-100 rounded-box shadow-md w-full">
      <li className="p-4 pb-2 flex justify-between items-end">
        <span className="text-xs opacity-60 tracking-wide">
          Recent Gifts & Reservations
        </span>
        <span className="text-[10px] opacity-40 uppercase font-bold">
          Private to you
        </span>
      </li>

      {reservations.map((res) => {
        const hasMessage = !!res.giver_message;
        const isCashGift = !!res.giver_amount && res.giver_amount !== 0;

        return (
          <li className="list-row group" key={res.id}>
            {/* --- Icon / Image --- */}
            <div className="size-10 rounded-box flex justify-center items-center overflow-hidden bg-base-200 relative border border-base-200">
              {res.item?.image_url ? (
                <Image
                  src={res.item.image_url}
                  alt="Item"
                  fill
                  className="object-cover"
                />
              ) : isCashGift ? (
                <Wallet className="text-success opacity-70" size={20} />
              ) : (
                <Gift className="text-secondary opacity-70" size={20} />
              )}
            </div>

            {/* --- Main Content --- */}
            <div className="grow">
              <div className="flex gap-2 items-center justify-between">
                <span className="font-semibold text-sm">
                  {res.giver_nickname || "Anonymous Friend"}
                </span>
                <span className="text-[10px] opacity-50 font-mono">
                  {formatDistanceToNow(res.reserved_at, { addSuffix: true })}
                </span>
              </div>

              <div className="text-xs opacity-70 flex items-center gap-1.5 mt-0.5 justify-between">
                {res.item ? (
                  <span className="line-clamp-1">
                    Reserved <strong>{res.item.name}</strong>
                  </span>
                ) : (
                  <span>Sent a gift</span>
                )}

                {/* Show Amount if available */}
                {isCashGift && (
                  <span className="badge badge-xs badge-success badge-outline">
                    {formatCurrency(res.giver_amount)}
                  </span>
                )}
              </div>

              {/* Message Preview */}
              {hasMessage && (
                <div className="mt-2 text-xs bg-base-200/50 p-2 rounded flex gap-2 items-start italic opacity-80">
                  <MessageSquareQuote size={14} className="shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{res.giver_message}</span>
                </div>
              )}
            </div>
          </li>
        );
      })}

      {reservations.length === 0 && (
        <li className="list-row justify-center items-center flex flex-col gap-2 py-8 text-center">
          <div className="bg-base-200 p-3 rounded-full">
            <Gift className="opacity-20" size={24} />
          </div>
          <div className="opacity-50 text-sm">
            No gifts received yet.
            <br />
            <span className="text-xs">Share your wishlist to get started!</span>
          </div>
        </li>
      )}
    </ul>
  );
}
