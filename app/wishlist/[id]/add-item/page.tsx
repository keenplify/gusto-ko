import AddItemModal from "@/components/modals/add-item-modal";
import { redirect, RedirectType } from "next/navigation";

export default async function WishlistItemAddPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const handleSuccess = async () => {
    "use server";

    redirect(`/wishlist/${id}`, RedirectType.push);
  };

  return <AddItemModal shareId={id} handleSuccess={handleSuccess} />;
}
