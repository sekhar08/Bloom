import { LogOut } from 'lucide-react';

export default function SignOutButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}
