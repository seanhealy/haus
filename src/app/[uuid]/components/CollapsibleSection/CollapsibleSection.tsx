import type { ReactNode } from "react";
import sectionStyles from "../SectionView/styles.module.css";
import { SectionOpenPersister } from "./SectionOpenPersister";

type Props = {
	uuid: string;
	sectionId: string;
	label: string;
	defaultOpen: boolean;
	children: ReactNode;
};

export function CollapsibleSection({
	uuid,
	sectionId,
	label,
	defaultOpen,
	children,
}: Props) {
	return (
		<details className={sectionStyles.section} open={defaultOpen}>
			<summary className={`${sectionStyles.label} ${sectionStyles.summary}`}>
				{label}
			</summary>
			{children}
			<SectionOpenPersister uuid={uuid} sectionId={sectionId} />
		</details>
	);
}
