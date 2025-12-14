import { unstable_noStore as noStore } from "next/cache";

import { auth, signIn, signOut } from "@/auth";

import UserWishlists from "@/components/lists/user-wishlists";
import UserSetup from "@/components/lists/user-setup";
import { User } from "@prisma/client";
import WishlistReservations from "@/components/lists/wishlist-reservations";
import { Gift } from "lucide-react";

export default async function Home() {
  noStore();

  const session = await auth();

  return (
    <div className="flex flex-col gap-4 px-4 pt-24 pb-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text flex gap-4 items-center justify-center text-primary">
          <Gift size={64} /> <span>Gusto ko ng ...</span>
        </h1>
        <p className="text-base-content/85 text-lg max-w-2xl mx-auto font-bold">
          The Pinoy Wishlist App ✨
        </p>
      </div>

      {session?.user?.id ? (
        <>
          <UserWishlists userId={session.user.id} />
          <WishlistReservations userId={session.user.id} />
          <UserSetup user={session.user as User} />
          <div className="mt-auto flex flex-gol gap-2 items-center justify-center">
            <p>You are logged in as {session.user.name} </p>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="btn btn-primary">Sign out</button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="mt-auto flex flex-col gap-2 justify-center items-center">
            <div className="card w-96 bg-base-content text-base-100 card-md shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Welcome</h2>
                <p>You need to sign in to use this service</p>

                <div className="justify-end card-actions">
                  <form
                    action={async () => {
                      "use server";
                      await signIn("auth0");
                    }}
                  >
                    <button className="btn btn-primary">Sign in</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
