import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useMemo } from "react";
import { QuickLinkIcon } from "@/app/components/QuickLinkIcon";
import type { QuickLink, Section } from "@/app/types";
import { EditableLinkTile } from "../EditableLinkTile";
import { EditableText } from "../EditableText";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, XIcon } from "../icons";
import styles from "./styles.module.css";

type Props = {
	section: Section;
	isEdit: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
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
	isEdit,
	open,
	onOpenChange,
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
		return section.label ? (
			<details
				className={styles.section}
				open={open}
				onToggle={(event) => onOpenChange(event.currentTarget.open)}
			>
				<summary className={`${styles.label} ${styles.summary}`}>
					{section.label}
				</summary>
				<SectionLinks
					section={section}
					isEdit={false}
					onAddLink={onAddLink}
					onRemoveLink={onRemoveLink}
					onUpdateLink={onUpdateLink}
				/>
			</details>
		) : (
			<section className={styles.section}>
				<SectionLinks
					section={section}
					isEdit={false}
					onAddLink={onAddLink}
					onRemoveLink={onRemoveLink}
					onUpdateLink={onUpdateLink}
				/>
			</section>
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
			<SectionLinks
				section={section}
				isEdit
				onAddLink={onAddLink}
				onRemoveLink={onRemoveLink}
				onUpdateLink={onUpdateLink}
			/>
		</section>
	);
}

type SectionLinksProps = {
	section: Section;
	isEdit: boolean;
	onAddLink: () => void;
	onRemoveLink: (linkIndex: number) => void;
	onUpdateLink: (linkIndex: number, next: QuickLink) => void;
};

function SectionLinks({
	section,
	isEdit,
	onAddLink,
	onRemoveLink,
	onUpdateLink,
}: SectionLinksProps) {
	const linkIds = useMemo(
		() => section.links.map((link) => link.id),
		[section.links],
	);

	if (!isEdit) {
		return (
			<nav
				className={styles.quicklinks}
				aria-label={section.label || "Quick links"}
			>
				{section.links.map((link) => (
					<a className={styles.quicklink} key={link.id} href={link.url}>
						<QuickLinkIcon url={link.url} icon={link.icon} loading="eager" />
						<span className={styles.quicklinkLabel}>{link.label}</span>
					</a>
				))}
			</nav>
		);
	}

	return (
		<SortableContext items={linkIds} strategy={rectSortingStrategy}>
			<div className={styles.quicklinks}>
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
