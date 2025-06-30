import { useSessionStore } from "@/store/useSessionStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useEditAddress() {
  const { token } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation({});
}
