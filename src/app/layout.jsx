import './globals.css';

export const metadata = {
  title: 'The Metals — LiDAR Terrain',
  description: 'Dalkey Quarry to Dún Laoghaire — Irish Transverse Mercator LiDAR visualisation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
