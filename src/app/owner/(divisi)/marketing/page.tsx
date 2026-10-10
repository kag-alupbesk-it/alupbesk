import { redirect } from "next/navigation";

export const metadata = {
  title: "Marketing | ALUPBESK Owner",
  description: "Pantau pesanan masuk divisi marketing.",
};

export default function Page() {
  redirect("/owner/pesanan");
}
