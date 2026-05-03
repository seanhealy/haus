import Image from "next/image";
import type { QuickLinkIcon as QuickLinkIconConfig } from "../types";

type Props = {
	url: string;
	icon?: QuickLinkIconConfig;
	loading?: "eager" | "lazy";
};

export function QuickLinkIcon({ url, icon, loading = "lazy" }: Props) {
	const src = iconUrlFor(url);
	return (
		<span className="quicklink-icon-wrap">
			<span
				className="quicklink-icon-tile"
				style={
					icon?.backgroundColor
						? { background: icon.backgroundColor }
						: undefined
				}
			>
				{src ? (
					<Image
						className="quicklink-icon"
						src={src}
						alt=""
						width={64}
						height={64}
						unoptimized
						loading={loading}
						style={
							icon?.scale ? { transform: `scale(${icon.scale})` } : undefined
						}
					/>
				) : null}
			</span>
		</span>
	);
}

function iconUrlFor(linkUrl: string): string {
	try {
		return `https://icon.horse/icon/${new URL(linkUrl).host}`;
	} catch {
		return "";
	}
}
