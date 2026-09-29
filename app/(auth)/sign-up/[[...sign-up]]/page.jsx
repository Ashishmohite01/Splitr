"use client";

import { SignUp, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const redirectUrl = searchParams.get("redirect_url") || "/dashboard";
      router.push(redirectUrl);
    }
  }, [isLoaded, isSignedIn, searchParams, router]);

  return <SignUp />;
}

