import '../globals.css';
import { ReduxProvider } from '../lib/redux/providers/ReduxProvider';
import Sidebar from '../components/layout/Sidebar';

export const metadata = {
  title: 'Burger House',
  description: 'Aplicación de pedidos para burger house',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <ReduxProvider>
          <Sidebar />
          <main className="pt-20 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </ReduxProvider>
      </body>
    </html>
  );
}


