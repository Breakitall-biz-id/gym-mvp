import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// Define cookie store interface
interface CookieStore {
  getAll: () => Array<{ name: string; value: string }>;
  set: (name: string, value: string, options?: any) => void;
  get: (name: string) => { value: string } | undefined;
}

export const createClient = (
  cookieStore?: CookieStore | ReadonlyRequestCookies
) => {
  // If cookieStore is provided, use it; otherwise try to get cookies()
  let cookieStoreToUse: CookieStore | ReadonlyRequestCookies;

  if (cookieStore) {
    cookieStoreToUse = cookieStore;
  } else {
    try {
      cookieStoreToUse = cookies();
    } catch (error) {
      // If cookies() fails, create a minimal cookie store
      cookieStoreToUse = {
        getAll: () => [],
        set: () => {},
        get: () => undefined,
      };
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStoreToUse.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStoreToUse.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
};
