import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
	backgroundImage: string;
	children: ReactNode;
};

// The shared page shell for both the view and the editor: the full-bleed
// background image plus the centered content column in front of it.
export function HomepageBackdrop({ backgroundImage, children }: Props) {
	return (
		<div className={styles.root}>
			<div className={styles.bg}>
				<Image
					src={backgroundImage}
					alt=""
					fill
					priority
					sizes="100vw"
					className={styles.bgImage}
				/>
			</div>
			<main className={styles.content}>{children}</main>
		</div>
	);
}
