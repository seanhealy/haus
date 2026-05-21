import { QuickLinkIcon } from "@/app/components/QuickLinkIcon";
import type { QuickLink } from "@/app/types";
import { PencilIcon } from "../icons";
import sectionStyles from "../SectionView/styles.module.css";
import styles from "./styles.module.css";

type Props = {
	link: QuickLink;
	// When set, the tile is editable: the icon and a pencil open the editor
	// rather than the icon being inert. Omitted for plain view tiles.
	onClick?: () => void;
};

// The inner content of a link tile — icon + label. The caller supplies the
// container element: an `<a href>` for navigable view links, a `<div>` for the
// draggable edit tile and the drag preview.
export function LinkTile({ link, onClick }: Props) {
	const icon = <QuickLinkIcon url={link.url} icon={link.icon} />;

	return (
		<>
			{onClick ? (
				<button type="button" className={styles.iconButton} onClick={onClick}>
					{icon}
				</button>
			) : (
				icon
			)}
			<span className={sectionStyles.quicklinkLabel}>
				{link.label || <span className={styles.placeholder}>Label</span>}
				{onClick ? (
					<button
						type="button"
						className={styles.editButton}
						onClick={onClick}
						aria-label="Edit link"
					>
						<PencilIcon size={12} />
					</button>
				) : null}
			</span>
		</>
	);
}
