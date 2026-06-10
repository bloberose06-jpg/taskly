import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
const supabase = await createServerSupabase();
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile from a profiles table (if you have one)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="max-w-lg mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <ProfileForm user={user} profile={profile} />
    </main>
  );
}
