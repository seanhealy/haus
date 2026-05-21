import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useMemo } from "react";
import type { QuickLink, Section } from "@/app/types";
import { CollapsibleSection } from "../CollapsibleSection";
import { EditableLinkTile } from "../EditableLinkTile";
import { EditableText } from "../EditableText";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, XIcon } from "../icons";
import { LinkTile } from "../LinkTile";
import styles from "./styles.module.css";

type Props = {
	section: Section;
	uuid: string;
	isEdit: boolean;
	defaultOpen: boolean;
	onLabelChange: (label: string) => void;
	onAddLink: () => void;
	onRemoveLink: (linkIndex: number) => void;
	onUpdateLink: (linkIndex: number, next: QuickLink) => void;
	onRemoveSection: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
};

export function SectionView({
	section,
	uuid,
	isEdit,
	defaultOpen,
	onLabelChange,
	onAddLink,
	onRemoveLink,
	onUpdateLink,
	onRemoveSection,
	onMoveUp,
	onMoveDown,
	canMoveUp,
	canMoveDown,
}: Props) {
	if (!isEdit) {
		const links = <ViewLinks section={section} />;
		return section.label ? (
			<CollapsibleSection
				uuid={uuid}
				sectionId={section.id}
				label={section.label}
				defaultOpen={defaultOpen}
			>
				{links}
			</CollapsibleSection>
		) : (
			<section className={styles.section}>{links}</section>
		);
	}

	return (
		<section className={`${styles.section} ${styles.editing}`}>
			<div className={styles.head}>
				<EditableText
					className={styles.label}
					value={section.label}
					placeholder="Section name"
					onChange={onLabelChange}
				/>
				<button
					type="button"
					className={styles.moveButton}
					onClick={onMoveUp}
					disabled={!canMoveUp}
					aria-label="Move section up"
				>
					<ChevronUpIcon size={18} />
				</button>
				<button
					type="button"
					className={styles.moveButton}
					onClick={onMoveDown}
					disabled={!canMoveDown}
					aria-label="Move section down"
				>
					<ChevronDownIcon size={18} />
				</button>
				<button
					type="button"
					className={styles.remove}
					onClick={onRemoveSection}
					aria-label="Remove section"
				>
					<XIcon size={18} />
				</button>
			</div>
			<EditableLinks
				section={section}
				onAddLink={onAddLink}
				onRemoveLink={onRemoveLink}
				onUpdateLink={onUpdateLink}
			/>
		</section>
	);
}

function ViewLinks({ section }: { section: Section }) {
	return (
		<nav
			className={styles.quicklinks}
			aria-label={section.label || "Quick links"}
		>
			{section.links.map((link) => (
				<a className={styles.quicklink} key={link.id} href={link.url}>
					<LinkTile link={link} />
				</a>
			))}
		</nav>
	);
}

type EditableLinksProps = {
	section: Section;
	onAddLink: () => void;
	onRemoveLink: (linkIndex: number) => void;
	onUpdateLink: (linkIndex: number, next: QuickLink) => void;
};

function EditableLinks({
	section,
	onAddLink,
	onRemoveLink,
	onUpdateLink,
}: EditableLinksProps) {
	const linkIds = useMemo(
		() => section.links.map((link) => link.id),
		[section.links],
	);
	const { setNodeRef } = useDroppable({
		id: section.id,
		data: { type: "section" },
	});

	return (
		<SortableContext items={linkIds} strategy={rectSortingStrategy}>
			<div ref={setNodeRef} className={styles.quicklinks}>
				{section.links.map((link, linkIndex) => (
					<EditableLinkTile
						key={link.id}
						id={link.id}
						link={link}
						onChange={(next) => onUpdateLink(linkIndex, next)}
						onRemove={() => onRemoveLink(linkIndex)}
					/>
				))}
				<button
					type="button"
					className={`${styles.quicklink} ${styles.addLink}`}
					onClick={onAddLink}
					aria-label="Add link"
				>
					<span className={styles.addLinkTile}>
						<PlusIcon size={28} />
					</span>
					<span className={styles.quicklinkLabel}>Add</span>
				</button>
			</div>
		</SortableContext>
	);
}
