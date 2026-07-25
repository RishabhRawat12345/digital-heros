import './globals.css';

export const metadata = {
  title: 'Page Pulse | URL Auditor',
  description: 'A powerful web tool to audit any URL instantly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
