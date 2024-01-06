'use client';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { logger } from '@/lib/log';

const routes: { name: string; href: string }[] = [
  { name: 'Overview', href: '/app/dashboard' },
  { name: 'Invoices', href: '/app/invoices' },
  { name: 'Customers', href: '/app/customers' },
  { name: 'Products', href: '/app/products' },
  { name: 'Settings', href: '/app/settings' }
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  logger.debug(pathname, 'pathname');
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((el) => (
        <Link
          href={el.href}
          className={
            pathname === el.href
              ? 'text-sm font-medium transition-colors hover:text-primary'
              : 'text-sm font-medium text-muted-foreground transition-colors hover:text-primary'
          }
          key={el.name}
        >
          {el.name}
        </Link>
      ))}
    </nav>
  );
}
