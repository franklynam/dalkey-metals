import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

function getGitHeadDate() {
  try {
    const out = execSync('git show -s --format=%cI HEAD', { encoding: 'utf-8' }).trim();
    return out.slice(0, 10); // YYYY-MM-DD
  } catch {
    return '';
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile Three.js ecosystem packages so Next.js can handle their ESM output
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  env: {
    NEXT_PUBLIC_LAST_MODIFIED: getGitHeadDate(),
    NEXT_PUBLIC_VERSION: version,
  },
};

export default nextConfig;
