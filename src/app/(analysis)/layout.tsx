import { MainNav } from '@/app/_components/main-nav';
import { Search } from '@/app/_components/search';
import TeamSwitcher from '@/app/_components/team-switcher';
import { UserNav } from '@/app/_components/user-nav';
import Image from 'next/image';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <header className="flex h-16 items-center border-b px-4">
          <TeamSwitcher />
          <MainNav className="mx-6" />
          <section className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </section>
        </header>
        {children}
      </div>
    </>
  );
}
