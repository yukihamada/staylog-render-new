'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/i18n/context';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const { t } = useI18n();

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="ml-6 space-x-2 lg:block">
          <Link href="/" className={s.link}>
            {t('common.pricing')}
          </Link>
          <Link href="/features" className={s.link}>
            {t('common.features')}
          </Link>
          <Link href="/support" className={s.link}>
            {t('common.support')}
          </Link>
          {user && (
            <Link href="/account" className={s.link}>
              {t('common.account')}
            </Link>
          )}
        </nav>
      </div>
      <div className="flex justify-end items-center space-x-4">
        <LanguageSwitcher />
        {user ? (
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()} />
            <button type="submit" className={s.link}>
              {t('common.signOut')}
            </button>
          </form>
        ) : (
          <Link href="/signin" className={s.link}>
            {t('common.signIn')}
          </Link>
        )}
      </div>
    </div>
  );
}
