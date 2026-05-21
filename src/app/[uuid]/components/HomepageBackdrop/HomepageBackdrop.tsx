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
			<div
				className={styles.bg}
				style={{ backgroundImage: `url(${backgroundImage})` }}
			/>
			<main className={styles.content}>{children}</main>
		</div>
	);
}
