export const metadata = {
	title: 'Sistema de Certificados',
	description: 'Verifica y genera certificados en PDF',
};

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es">
			<body>
				{children}
			</body>
		</html>
	);
}
