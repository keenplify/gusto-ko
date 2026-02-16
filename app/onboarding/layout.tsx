import OnboardingSteps from "@/components/steps/onboarding-steps";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full w-full min-h-screen">
      <header className="w-full bg-accent/75 text-base-content flex justify-center">
        <div className="max-w-4xl w-full p-4 bg-accent flex justify-center">
          <OnboardingSteps />
        </div>
      </header>
      <div className="w-full bg-base-300 flex justify-center grow">
        <main className="max-w-4xl w-full mx-auto grow flex flex-col bg-base-200 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
