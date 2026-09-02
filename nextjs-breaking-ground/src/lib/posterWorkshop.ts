import {notFound} from "next/navigation"

export function assertLocalPosterWorkshop() {
  if (process.env.VERCEL) notFound()
}
