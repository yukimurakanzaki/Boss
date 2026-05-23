import './globals.css';

export const metadata = {
  title: 'ELIS — E-Litigation System',
  description: 'E-Litigation System PT Bussan Auto Finance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-full" style={{ margin: 0, background: '#f1f5f9' }}>
        {children}
      </body>
    </html>
  );
}