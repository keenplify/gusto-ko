import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ChevronRight, Gift } from "lucide-react";
import { pluralize } from "@/lib/string";
import Link from "next/link";
import SetupBirthdateModal from "@/components/modals/setup-birthdate-modal";

interface UserWishlistsProps {
  userId: string;
}
export default async function UserWishlists({ userId }: UserWishlistsProps) {
  const session = await auth();

  const isSelf = session?.user?.id === userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, birthdate: true },
  });

  const wishlists = userId
    ? await prisma.wishlist.findMany({
        where: {
          userId: userId,
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      })
    : [];

  return (
    <ul className="list bg-base-100 rounded-box shadow-md w-full">
      {isSelf && !user?.birthdate && <SetupBirthdateModal />}

      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
        {isSelf ? "Your Wishlists" : `${user?.name || "Their"} Wishlists`}
      </li>

      {wishlists.map((wishlist) => (
        <Link href={`/wishlist/${wishlist.shareId}`} key={wishlist.id}>
          <li className="list-row">
            <div className="size-10 rounded-box flex justify-center items-center">
              <Gift />
            </div>
            <div>
              <div className="flex gap-2 items-center">
                <span>{wishlist.name}</span>
                <div
                  className={`size-2 rounded-full ${
                    wishlist.is_public ? "bg-success" : "bg-neutral"
                  }`}
                />
              </div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {wishlist._count.items}{" "}
                {pluralize("item", wishlist._count.items)}
              </div>
            </div>
            <button className="btn btn-square btn-ghost">
              <ChevronRight />
            </button>
          </li>
        </Link>
      ))}
      {wishlists.length === 0 && (
        <li className="list-row justify-center items-center flex flex-col gap-4">
          <div>You have no wishlists yet. Start by creating one!</div>
          <button className="btn btn-success">Create Wishlist</button>
        </li>
      )}
    </ul>
  );
}
