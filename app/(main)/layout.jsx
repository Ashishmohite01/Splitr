"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { RedirectToSignIn } from "@clerk/nextjs";
import { BarLoader } from "react-spinners";
import React from "react";

const MainLayout = ({ children }) => {
  return (
    <>
      <Authenticated>
        <div className="container mx-auto mt-24 mb-20 px-4">{children}</div>
      </Authenticated>

      <AuthLoading>
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <BarLoader width={"200px"} color="#36d7b7" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
};

export default MainLayout;

