import '../styles/globals.css';
import type { AppProps } from 'next/app';
import TAndCModal from '../components/TAndCModal';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <TAndCModal />
      <Component {...pageProps} />
    </>
  );
}
