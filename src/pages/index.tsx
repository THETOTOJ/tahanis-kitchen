import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/recipes");
  }, [router]);

  return <p>Redirecting...</p>;
}