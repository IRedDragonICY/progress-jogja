import { AppProps } from 'next/app';
import { Geist, Geist_Mono } from "next/font/google";
import Layout from '../components/layout';
import "../app/globals.css";
import { NextPageWithLayout } from '@/types/next-page';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Layout>
        {getLayout(<Component {...pageProps} />)}
      </Layout>
    </div>
  );
}
