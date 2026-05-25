import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, logout, listAccounts, updateUser, getUser } from "@/lib/api/auth.api";
import type { Account, User } from "@/lib/api/types";
import { useEffect, useState } from "react";

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    onSuccess: () => router.push("/workspaces/default/boards"),
    onError: (error) => console.error("Login failed", error),
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: register,
    onSuccess: () => router.push("/workspaces/default/boards"),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}

export function useListAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: listAccounts,
  });
}

export function useGetUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => (id ? getUser(id) : null),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Account> }) =>
      updateUser(id, updates),
    onSuccess: (updatedUser) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}


// Custom hook to get authenticated user from localStorage
// Returns null if user is not authenticated or if there is an error parsing the user data
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          setUser(null);
        }
      }
    }, []);
    return user;
}
