import type { QuickLink } from "@/app/types";
import { LinkTile } from "../LinkTile";
import sectionStyles from "../SectionView/styles.module.css";

type Props = {
	link: QuickLink;
};

export function LinkTilePreview({ link }: Props) {
	return (
		<div className={sectionStyles.quicklink}>
			<LinkTile link={link} />
		</div>
	);
}
