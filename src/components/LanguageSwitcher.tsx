'use client';

import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ChangeEvent, useTransition } from 'react';

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(nextLocale);
    });
  };

  return (
    <select
      defaultValue={locale}
      disabled={isPending}
      onChange={onSelectChange}
      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="en">English</option>
      <option value="es">Espanol</option>
      <option value="fr">Francais</option>
    </select>
  );
}
