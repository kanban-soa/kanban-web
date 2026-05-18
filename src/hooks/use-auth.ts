import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, logout, listAccounts } from "@/lib/api/auth.api";

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
