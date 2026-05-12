import { QuickLinkIcon } from "@/app/components/QuickLinkIcon";
import type { QuickLink } from "@/app/types";
import sectionStyles from "../SectionView/styles.module.css";
import styles from "./styles.module.css";

type Props = {
	link: QuickLink;
};

export function LinkTilePreview({ link }: Props) {
	return (
		<div className={sectionStyles.quicklink}>
			<QuickLinkIcon url={link.url} icon={link.icon} />
			<span className={sectionStyles.quicklinkLabel}>
				{link.label || <span className={styles.labelPlaceholder}>Label</span>}
			</span>
		</div>
	);
}
