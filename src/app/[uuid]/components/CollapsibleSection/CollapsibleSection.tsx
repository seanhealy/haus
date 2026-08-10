import type { ReactNode } from "react";
import sectionStyles from "../SectionView/styles.module.css";
import { SectionOpenPersister } from "./SectionOpenPersister";

type Props = {
	uuid: string;
	sectionId: string;
	label: string;
	children: ReactNode;
};

// Leave `open` uncontrolled so React won't fight the out-of-band restore.
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
