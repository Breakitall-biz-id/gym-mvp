"use client";

import { useState, useEffect, useCallback } from "react";
import { Member } from "@/lib/types";

interface UseMembers {
  members: Member[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchMembers: (query: string) => Promise<void>;
}

export function useMembers(): UseMembers {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL("/api/members", window.location.origin);
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }

      const response = await fetch(url.toString(), {
        // Add cache headers for better performance
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const result = await response.json();

      if (result.success) {
        setMembers(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch members");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchMembers();
  }, [fetchMembers]);

  const searchMembers = useCallback(
    async (query: string) => {
      await fetchMembers(query);
    },
    [fetchMembers]
  );

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refresh,
    searchMembers,
  };
}

// Hook untuk optimasi search dengan debouncing
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
