import { useForm } from "@tanstack/react-form";

export default function LoginPage() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <div className="flex flex-col px-2 w-full items-center h-full min-h-[100vh]">
      <div className="max-w-5xl w-full pt-10 px-4 bg-slate-300 text-slate-900 grow">
        <h1 className="text-2xl font-bold mb-4">Login Page</h1>
      </div>
    </div>
  );
}
