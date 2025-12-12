import { auth } from "@/auth";
import WishlistItems from "@/components/lists/wishlist-items";
import prisma from "@/lib/prisma";
import { Gift, Plus, QrCode } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;

  const wishlist = await prisma.wishlist.findFirst({
    where: {
      shareId: id,
    },
  });

  return {
    title: `${wishlist?.name || "Wishlist"} - gustoko.ng`,
  };
}

export default async function WishlistLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const wishlist = id
    ? await prisma.wishlist.findFirst({
        where: {
          shareId: id,
        },
        include: {
          user: {
            select: {
              gcashQRUrl: true,
            },
          },
        },
      })
    : null;
  const session = await auth();
  const isOwnWishlist = session?.user?.id === wishlist?.userId;

  return (
    <div className="flex flex-col gap-4 grow p-8 h-full max-h-screen">
      {id && <WishlistItems shareId={id} expanded={!isOwnWishlist} />}
      {isOwnWishlist ? (
        <Link
          href={`/wishlist/${id}/add-item`}
          className="btn btn-success w-full"
        >
          <Plus /> Add to Wishlist
        </Link>
      ) : (
        <div className="bg-primary flex p-4 rounded-lg justify-between">
          <div className="flex gap-1 items-center">
            Give <Gift size={18} /> that they will remember
          </div>
          {wishlist?.user.gcashQRUrl && (
            <button className="btn btn-success">
              Give Cash via GCash QR <QrCode />
            </button>
          )}
        </div>
      )}

      <footer className="flex justify-center items-center text-sm opacity-80 gap-1">
        <span>Powered by</span>
        <Link href="/" target="_blank" className="link">
          gustoko.ng
        </Link>
        <span> - Curate your Wishlist!</span>
      </footer>
      {children}
    </div>
  );
}
