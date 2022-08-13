import Image from "next/future/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { FC } from "react";
import { AiFillHome, AiOutlineHome } from "react-icons/ai";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { RiUserShared2Fill, RiUserShared2Line } from "react-icons/ri";

import { formatAccountName } from "@/utils/text";

interface User {
  id: string | null;
  image: string | null;
  name: string | null;
}

interface SidebarProps {
  suggestedAccounts: User[];
  followingAccounts: User[];
}
const Sidebar: FC<SidebarProps> = ({
  suggestedAccounts = [],
  followingAccounts = [],
}) => {
  const router = useRouter();
  const session = useSession();

  return (
    <div className="w-[48px] border-r lg:border-none lg:w-[348px] h-[calc(100vh-60px)] sticky top-[60px] overflow-y-auto flex-shrink-0 py-5">
      <div className="flex flex-col items-stretch gap-5 [&_svg]:h-7 [&_svg]:w-7 font-semibold pb-6 border-b">
        <Link href="/">
          <a
            className={`flex items-center gap-2 ${
              !router.query.following
                ? "fill-pink text-pink"
                : "fill-black text-black"
            }`}
          >
            {!router.query.following ? <AiFillHome /> : <AiOutlineHome />}
            <span className="hidden lg:inline">For You</span>
          </a>
        </Link>
        <Link href={session.data?.user ? "/?following=1" : "/sign-in"}>
          <a
            className={`flex items-center gap-2 ${
              router.query.following
                ? "fill-pink text-pink"
                : "fill-black text-black"
            }`}
          >
            {router.query.following ? (
              <RiUserShared2Fill />
            ) : (
              <RiUserShared2Line />
            )}
            <span className="hidden lg:inline">Following</span>
          </a>
        </Link>
      </div>

      {suggestedAccounts.length > 0 && (
        <div className="flex flex-col items-stretch gap-3 py-4 border-b">
          <p className="text-sm hidden lg:block">Suggested Accounts</p>
          {suggestedAccounts.map((account) => (
            <Link href={`/user/${account.id}`} key={account.id}>
              <a className="flex items-center gap-3">
                <Image
                  className="rounded-full object-cover"
                  height={36}
                  width={36}
                  src={account.image!}
                  alt=""
                />

                <div className="hidden lg:block">
                  <p className="relative leading-[1]">
                    <span className="font-semibold text-sm">
                      {formatAccountName(account.name!)}
                    </span>
                    <BsFillCheckCircleFill className="absolute w-[14px] h-[14px] right-[-20px] top-1 fill-[#20D5EC]" />
                  </p>
                  <p className="font-light text-xs">{account.name}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
      {followingAccounts.length > 0 && (
        <div className="flex flex-col items-stretch gap-3 py-4 border-b">
          <p className="text-sm">Following Accounts</p>
          {followingAccounts.map((account) => (
            <Link href={`/user/${account.id}`} key={account.id}>
              <a className="flex items-center gap-3">
                <Image
                  className="rounded-full object-cover"
                  src={account.image!}
                  height={36}
                  width={36}
                  alt=""
                />

                <div>
                  <p className="relative leading-[1]">
                    <span className="font-semibold text-sm">
                      {formatAccountName(account.name!)}
                    </span>
                    <BsFillCheckCircleFill className="absolute w-[14px] h-[14px] right-[-20px] top-1 fill-[#20D5EC]" />
                  </p>
                  <p className="font-light text-xs">{account.name}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}

      <div className="[&_p]:cursor-pointer [&_p:hover]:underline text-xs leading-[1.2] mt-5 text-zinc-400 flex-col items-stretch gap-4 hidden lg:flex">
        <div className="flex flex-wrap gap-2">
          <p>About</p>
          <p>Newsroom</p>
          <p>Store</p>
          <p>Contact</p>
          <p>Carrers</p>
          <p>ByteDance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <p>TikTik for Good</p>
          <p>Advertise</p>
          <p>Developers</p>
          <p>Transparency</p>
          <p>TikTik Rewards</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <p>Help</p>
          <p>Safety</p>
          <p>Terms</p>
          <p>Privacy</p>
          <p>Creator Portal</p>
          <p>Community Guidelines</p>
        </div>
        <span>© 2022 TopTop</span>
      </div>
    </div>
  );
};

export default Sidebar;
