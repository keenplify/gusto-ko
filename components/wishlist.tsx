import { Wishlist } from "@prisma/client";

interface WishlistProps {
  item: Wishlist;
}
export default function WishlistContainer({ item }: WishlistProps) {
  return <div>{item.name}</div>;
}
