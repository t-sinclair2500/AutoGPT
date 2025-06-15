import type { UnsafeUnwrappedCookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function getServerSupabase() {
  // Need require here, so Next.js doesn't complain about importing this on client side
  const { cookies } = require("next/headers");
  const cookieStore = (await cookies()) as UnsafeUnwrappedCookies;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
            const cookieStore = await cookies();
            return cookieStore.getAll();
          },
          setAll: async (cookiesToSet) => {
            try {
              const cookieStore = await cookies();
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );

    return supabase;
  } catch (error) {
    throw error;
  }
}
