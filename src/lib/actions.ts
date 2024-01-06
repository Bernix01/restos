"use server";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/server/auth";

export async function authenticate() {
  await signIn("github");
}

export async function logOut() {
  const url = (await signOut({ redirect: false })) as string;
  redirect(url);
}

// export async function parseInvoice(invoiceStr: Buffer) {}
