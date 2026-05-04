import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const iaWriter = localFont({
	src: [
		{
			path: "./fonts/iawriter-quattro-400.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/iawriter-quattro-700.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-iawriter",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Haus",
	description: "Custom homepage",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={iaWriter.variable}>
			<body>{children}</body>
		</html>
	);
}
