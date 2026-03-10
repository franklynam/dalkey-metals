'use client';

import dynamic from 'next/dynamic';

/**
 * Dynamic import with ssr:false is required because:
 *  - @react-three/fiber's Canvas accesses window / WebGL at module load time
 *  - Next.js App Router runs layouts & pages on the server by default
 */
const App = dynamic(() => import('../components/App'), { ssr: false });

export default function Page() {
  return <App />;
}
