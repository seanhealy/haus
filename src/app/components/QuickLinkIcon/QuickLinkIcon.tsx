import Image from "next/image";
import type { QuickLinkIcon as QuickLinkIconConfig } from "../../types";
import styles from "./styles.module.css";

type Props = {
	url: string;
	icon?: QuickLinkIconConfig;
	loading?: "eager" | "lazy";
	size?: number;
};

export function QuickLinkIcon({ url, icon, loading = "lazy", size }: Props) {
	const src = icon?.image || iconUrlFor(url);
	return (
		<span className={styles.wrap}>
			<span
				className={styles.tile}
				style={{
					...(size ? { width: size, height: size } : null),
					...(icon?.backgroundColor
						? { background: icon.backgroundColor }
						: null),
				}}
			>
				{src ? (
					<Image
						className={styles.icon}
						src={src}
						alt=""
						width={64}
						height={64}
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
