import type { NextPage } from "next";
import Link from "next/link";

import Meta from "@/components/Shared/Meta";

const NotFound: NextPage = () => {
  return (
    <>
      <Meta
        title="Not Found | TopTop"
        description="Not Found"
        image="/favicon.png"
      />

      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-center">The resource could not be found</h1>
        <Link href="/">
          <a className="text-pink">Return Home</a>
        </Link>
      </div>
    </>
  );
};

export default NotFound;
