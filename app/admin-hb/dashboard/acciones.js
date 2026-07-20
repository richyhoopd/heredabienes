"use server";

import { revalidatePath } from "next/cache";

export async function revalidarPropiedad(slug, slugAnterior) {
  revalidatePath("/propiedades");
  if (slug) revalidatePath("/propiedades/" + slug);
  if (slugAnterior && slugAnterior !== slug) {
    revalidatePath("/propiedades/" + slugAnterior);
  }
  revalidatePath("/");
  return { ok: true };
}
