import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { QuickLink } from "@/app/types";
import { LinkPopover } from "../LinkPopover";
import { LinkTile } from "../LinkTile";
import sectionStyles from "../SectionView/styles.module.css";
import styles from "./styles.module.css";

type Props = {
	id: string;
	link: QuickLink;
	onChange: (next: QuickLink) => void;
	onRemove: () => void;
};

export function EditableLinkTile({ id, link, onChange, onRemove }: Props) {
	const sortable = useSortable({ id, data: { type: "link" } });
	const [isOpen, setIsOpen] = useState(false);

	const style = {
		transform: CSS.Transform.toString(sortable.transform),
		transition: sortable.transition,
		opacity: sortable.isDragging ? 0.5 : 1,
	};

	return (
		<div
			className={`${sectionStyles.quicklink} ${styles.editable}`}
			ref={sortable.setNodeRef}
			style={style}
			{...sortable.attributes}
			{...sortable.listeners}
		>
			<LinkTile link={link} onClick={() => setIsOpen(true)} />
			<LinkPopover
				open={isOpen}
				link={link}
				onChange={onChange}
				onRemove={() => {
					setIsOpen(false);
					onRemove();
				}}
				onClose={() => setIsOpen(false)}
			/>
		</div>
	);
}
