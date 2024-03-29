import Navbar from '@/components/ui/Navbar';
import './globals.css';
import './prismjs-theme.css';
import './satoshi.css';
import { Inter } from 'next/font/google';

import SupabaseListener from '@/components/supabase/listener';
import SupabaseProvider from '@/components/supabase/provider';
import { createServerClient } from '@/utils/supabase/server';
import type { Database, Profile } from '@/utils/supabase/types';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import ProfileService from '@/utils/supabase/services/profile';
import ModalBannerCodeClient from '@/components/ui/ModalBannerCode/ModalBannerCodeClient';

import ProfileFormModal from '@/components/ui/ProfileFormModal';
import DashboardLayout from '@/components/DashboardLayout';
import PolkadotWalletProvider from '@/components/ui/PolkadotWalletProvider';

export type TypedSupabaseClient = SupabaseClient<Database>;

const { title, description, ogImage } = {
  title: 'OpenGuild Apps - Community platform of OpenGuild',
  description: 'Level up your Polkadot career!',
  ogImage: 'https://apps.openguild.wtf/levelup-og.png',
};

export const metadata = {
  title,
  description,
  metadataBase: new URL('https://apps.openguild.wtf'),
  openGraph: {
    title,
    description,
    images: [ogImage],
    url: 'https://apps.openguild.wtf',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
};

const inter = Inter({ subsets: ['latin'] });

// do not cache this layout
export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  const profileService = new ProfileService(createServerClient());
  const profile = user ? await profileService.getById(user?.id) : null;
  const profileNoCache = user ? await profileService.getByIdWithNoCache(user?.id) : null;

  return (
    <html lang="en" className="bg-gray-50">
      <head>
        <meta httpEquiv="Content-Language" content="en" />
        <meta property="og:locale" content="en_US" />
        <meta name="language" content="English" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0"
        />
      </head>
      <body className={inter.className}>
        <main>
          <SupabaseProvider user={profile as Profile} session={session}>
            <PolkadotWalletProvider>
              <SupabaseListener serverAccessToken={session?.access_token} />
              <ProfileFormModal
                isModalOpen={user ? (profileNoCache?.social_url == null ? true : false) : false}
              />
              <ModalBannerCodeClient />
              <DashboardLayout>{children}</DashboardLayout>
            </PolkadotWalletProvider>
          </SupabaseProvider>
        </main>
      </body>
    </html>
  );
}
