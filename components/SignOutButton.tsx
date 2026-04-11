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
        className="ui-button-secondary min-w-28"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </form>
  );
}
