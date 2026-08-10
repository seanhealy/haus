import type { ReactNode } from "react";
import sectionStyles from "../SectionView/styles.module.css";
import { SectionOpenPersister } from "./SectionOpenPersister";

type Props = {
	uuid: string;
	sectionId: string;
	label: string;
	children: ReactNode;
};

// Sections default to open; the initial open/closed state is driven outside
// React (SectionsRestoreScript before paint, SectionOpenPersister on mount),
// so `open` is left uncontrolled and hydration is suppressed for it.
export function CollapsibleSection({
	uuid,
	sectionId,
	label,
	children,
}: Props) {
	return (
		<details
			className={sectionStyles.section}
			data-section-id={sectionId}
			suppressHydrationWarning
		>
			<summary className={`${sectionStyles.label} ${sectionStyles.summary}`}>
				{label}
			</summary>
			{children}
			<SectionOpenPersister uuid={uuid} sectionId={sectionId} />
		</details>
	);
}
