import { Wishlist, WishlistItem } from "@prisma/client";

interface WishlistProps {
  wishlist: Wishlist & {
    items: WishlistItem[];
  };
}
export default function WishlistCard({ wishlist }: WishlistProps) {
  return <div className="card bg-base-200">{wishlist.name} wews</div>;
}
