import './globals.css';

export const metadata = {
  title: 'LibraryMS',
  description: 'Library Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
