import Link from "next/link";

const options = [
  {
    id: "christmas",
    title: "Christmas & Holidays",
    description: "Perfect for Monito-Monita and family reunions.",
    icon: "🎄",
  },
  {
    id: "birthday",
    title: "Birthday Celebration",
    description: "Let everyone know your Gusto list this year.",
    icon: "🎂",
  },
  {
    id: "personal",
    title: "Personal Wishlist",
    description: "A private place to save Shopee/Lazada links for yourself.",
    icon: "🔒",
  },
];

export default function OnboardingPage() {
  return (
    <div className="flex flex-col gap-4 grow">
      <div className="p-4 lg:px-8 text-center">
        <div className="font-bold">How will you use Gustoko.ng?</div>
        <p className="text-cente text-sm">
          Help us customize your experience. Your choice helps us organize your
          dashboard and set the right reminders for your loved ones.
        </p>
        <p className="italic font-bold text-sm mt-2">
          You can always create more wishlists later.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-2 grow">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex justify-center flex-col items-center"
          >
            <Link
              href={`/onboarding/create-wishlist?type=${option.id}`}
              className="btn btn-primary btn-outline h-32 w-32 text-8xl lg:h-64 lg:w-64 lg:text-9xl"
            >
              {option.icon}
            </Link>
            <h4 className="font-bold text-center">{option.title}</h4>
            <p className="text-center text-xs lg:text-sm">
              {option.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
