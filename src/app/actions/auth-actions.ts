"use server";

import { signIn, signOut } from "@/auth";

export async function loginWithLine() {
  await signIn("line", { redirectTo: "/backup" });
}

export async function logout() {
  await signOut({ redirectTo: "/backup" });
}
