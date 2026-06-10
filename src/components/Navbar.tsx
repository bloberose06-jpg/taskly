import Link from "next/link";

// Inside your nav component (server component):
const { data: { user } } = await supabase.auth.getUser();

{user && (
  <Link href="/profile" className="text-sm hover:underline">
    Profile
  </Link>
)}
