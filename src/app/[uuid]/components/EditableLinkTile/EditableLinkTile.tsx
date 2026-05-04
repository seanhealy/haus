import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import { QuickLinkIcon } from "@/app/components/QuickLinkIcon";
import type { QuickLink } from "@/app/types";
import { GripIcon, PencilIcon } from "../icons";
import { LinkPopover } from "../LinkPopover";
import sectionStyles from "../SectionView/styles.module.css";
import styles from "./styles.module.css";

type Props = {
	id: string;
	link: QuickLink;
	onChange: (next: QuickLink) => void;
	onRemove: () => void;
};

export function EditableLinkTile({ id, link, onChange, onRemove }: Props) {
	const sortable = useSortable({ id });
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);
	const tileRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isPopoverOpen) return;
		function handler(event: MouseEvent) {
			const target = event.target as Node;
			if (popoverRef.current?.contains(target)) return;
			if (tileRef.current?.contains(target)) return;
			setIsPopoverOpen(false);
		}
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [isPopoverOpen]);

	function setRefs(node: HTMLDivElement | null) {
		sortable.setNodeRef(node);
		tileRef.current = node;
	}

	const style = {
		transform: CSS.Transform.toString(sortable.transform),
		transition: sortable.transition,
		opacity: sortable.isDragging ? 0.5 : 1,
	};

	return (
		<div
			className={`${sectionStyles.quicklink} ${styles.editable}`}
			ref={setRefs}
			style={style}
			{...sortable.attributes}
		>
			<button
				type="button"
				className={styles.dragHandle}
				{...sortable.listeners}
				aria-label="Drag link"
			>
				<GripIcon size={14} />
			</button>
			<button
				type="button"
				className={styles.editButton}
				onClick={() => setIsPopoverOpen(true)}
				aria-label="Edit link"
			>
				<PencilIcon size={14} />
			</button>
			<button
				type="button"
				className={styles.tileButton}
				onClick={() => setIsPopoverOpen(true)}
			>
				<QuickLinkIcon url={link.url} icon={link.icon} />
			</button>
			<span className={sectionStyles.quicklinkLabel}>
				{link.label || <span className={styles.labelPlaceholder}>Label</span>}
			</span>
			{isPopoverOpen ? (
				<LinkPopover
					ref={popoverRef}
					link={link}
					onChange={onChange}
					onRemove={() => {
						setIsPopoverOpen(false);
						onRemove();
					}}
					onClose={() => setIsPopoverOpen(false)}
				/>
			) : null}
		</div>
	);
}
