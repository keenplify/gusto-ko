import { auth } from "@/auth";
import GCashButton from "@/components/buttons/gcash";
import WishlistItems from "@/components/lists/wishlist-items";
import ShareWishlistModal from "@/components/modals/share-wishlist-modal";
import prisma from "@/lib/prisma";
import { Plus } from "lucide-react";
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
          user: true,
        },
      })
    : null;
  const session = await auth();
  const isOwnWishlist = session?.user?.id === wishlist?.userId;

  return (
    <div className="flex flex-col gap-4 grow p-4 lg:p-8 h-full max-h-screen">
      {id && <WishlistItems shareId={id} expanded={!isOwnWishlist} />}
      {isOwnWishlist ? (
        <div className="flex gap-2 items-center">
          <Link
            href={`/wishlist/${id}/add-item`}
            className="btn btn-success flex-1"
          >
            <Plus /> Add to Wishlist
          </Link>
          <ShareWishlistModal shareId={id} wishlistName={wishlist?.name} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row justify-center items-center gap-3">
          <div className="bg-linear-to-r from-primary to-primary/80 text-primary-content rounded-lg p-4 md:p-6">
            <h3 className="font-bold text-lg mb-2">Support Their Dreams</h3>
            <p className="text-sm opacity-90 mb-4">
              Pick something from this wishlist and make them smile. Every gift
              matters!
            </p>
            {wishlist?.user.gcashQRUrl && <GCashButton user={wishlist.user} />}
          </div>
          <div className="flex justify-end">
            <ShareWishlistModal shareId={id} wishlistName={wishlist?.name} />
          </div>
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
