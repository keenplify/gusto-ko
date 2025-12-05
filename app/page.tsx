import { unstable_noStore as noStore } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import Wishlist from "@/components/wishlist";

export default async function Home() {
  noStore();

  const session = await auth();
  const wishlists = session?.user?.id
    ? await prisma.wishlist.findMany({
        where: {
          userId: session?.user.id,
        },
        include: {
          items: {
            include: {
              _count: true,
            },
          },
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-200 to-neutral-50 text-neutral-800">
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text">
            Gusto ko ng ...
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            The Pinoy Wishlist App
          </p>
        </div>
        <div className="flex justify-center">
          {wishlists.map((wishlist) => (
            <Wishlist item={wishlist} key={wishlist.id} />
          ))}
          {wishlists.length === 0 && (
            <div className="flex flex-col gap-4">
              <div>You have no wishlists yet. Start by creating one!</div>
              <button className="btn btn-success">Create Wishlist</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
