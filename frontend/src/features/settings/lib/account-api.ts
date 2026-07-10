import { apiFetch } from "@/lib/api";

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiFetch("/me/password", {
    method: "PATCH",
    auth: true,
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

export async function deleteAccount(password: string): Promise<void> {
  await apiFetch("/me", { method: "DELETE", auth: true, body: { password } });
}
