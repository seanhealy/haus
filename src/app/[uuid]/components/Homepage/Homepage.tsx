"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { HomeConfig, QuickLink } from "@/app/types";
import { saveHomepage } from "../../actions";
import { EditableText } from "../EditableText";
import { EditToolbar } from "../EditToolbar";
import { PencilIcon, PlusIcon } from "../icons";
import { SectionView } from "../SectionView";
import styles from "./styles.module.css";

type Props = {
	uuid: string;
	initial: HomeConfig;
};

type Mode = "view" | "edit";

export function Homepage({ uuid, initial }: Props) {
	const baseId = useId();
	const keyCounterRef = useRef(0);
	function newKey() {
		keyCounterRef.current += 1;
		return `${baseId}-${keyCounterRef.current}`;
	}

	const [mode, setMode] = useState<Mode>("view");
	const [config, setConfig] = useState<HomeConfig>(initial);
	const [sectionKeys, setSectionKeys] = useState<string[]>(() =>
		initial.sections.map(() => newKey()),
	);
	const [linkKeysBySection, setLinkKeysBySection] = useState<string[][]>(() =>
		initial.sections.map((s) => s.links.map(() => newKey())),
	);
	const [lastSavedConfig, setLastSavedConfig] = useState<HomeConfig>(initial);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const isDirty = config !== lastSavedConfig;

	useEffect(() => {
		if (!isDirty) return;
		function handler(event: BeforeUnloadEvent) {
			event.preventDefault();
		}
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDirty]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 200, tolerance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function enterEdit() {
		setMode("edit");
		setError(null);
	}

	function discard() {
		setConfig(lastSavedConfig);
		setSectionKeys(lastSavedConfig.sections.map(() => newKey()));
		setLinkKeysBySection(
			lastSavedConfig.sections.map((s) => s.links.map(() => newKey())),
		);
		setError(null);
		setMode("view");
	}

	function save() {
		setError(null);
		const snapshot = config;
		startTransition(async () => {
			const result = await saveHomepage(uuid, snapshot);
			if (result.ok) {
				setLastSavedConfig(snapshot);
				setMode("view");
			} else {
				setError(result.error);
			}
		});
	}

	function updateTitle(title: string) {
		setConfig((current) => ({ ...current, title }));
	}

	function updateSubtitle(subtitle: string) {
		setConfig((current) => ({ ...current, subtitle }));
	}

	function updateBackgroundImage(image: string) {
		setConfig((current) => ({ ...current, background: { image } }));
	}

	function updateSectionLabel(sectionIndex: number, label: string) {
		setConfig((current) => ({
			...current,
			sections: current.sections.map((section, i) =>
				i === sectionIndex ? { ...section, label } : section,
			),
		}));
	}

	function addSection() {
		setConfig((current) => ({
			...current,
			sections: [...current.sections, { label: "", links: [] }],
		}));
		setSectionKeys((keys) => [...keys, newKey()]);
		setLinkKeysBySection((keys) => [...keys, []]);
	}

	function removeSection(sectionIndex: number) {
		if (!confirm("Remove this section and all its links?")) return;
		setConfig((current) => ({
			...current,
			sections: current.sections.filter((_, i) => i !== sectionIndex),
		}));
		setSectionKeys((keys) => keys.filter((_, i) => i !== sectionIndex));
		setLinkKeysBySection((keys) => keys.filter((_, i) => i !== sectionIndex));
	}

	function updateLink(
		sectionIndex: number,
		linkIndex: number,
		next: QuickLink,
	) {
		setConfig((current) => ({
			...current,
			sections: current.sections.map((section, i) =>
				i === sectionIndex
					? {
							...section,
							links: section.links.map((link, j) =>
								j === linkIndex ? next : link,
							),
						}
					: section,
			),
		}));
	}

	function addLink(sectionIndex: number) {
		setConfig((current) => ({
			...current,
			sections: current.sections.map((section, i) =>
				i === sectionIndex
					? {
							...section,
							links: [
								...section.links,
								{ label: "New link", url: "https://example.com" },
							],
						}
					: section,
			),
		}));
		setLinkKeysBySection((keys) =>
			keys.map((sectionKeys, i) =>
				i === sectionIndex ? [...sectionKeys, newKey()] : sectionKeys,
			),
		);
	}

	function removeLink(sectionIndex: number, linkIndex: number) {
		setConfig((current) => ({
			...current,
			sections: current.sections.map((section, i) =>
				i === sectionIndex
					? {
							...section,
							links: section.links.filter((_, j) => j !== linkIndex),
						}
					: section,
			),
		}));
		setLinkKeysBySection((keys) =>
			keys.map((sectionKeys, i) =>
				i === sectionIndex
					? sectionKeys.filter((_, j) => j !== linkIndex)
					: sectionKeys,
			),
		);
	}

	function moveSection(from: number, to: number) {
		setConfig((current) => ({
			...current,
			sections: reorder(current.sections, from, to),
		}));
		setSectionKeys((keys) => reorder(keys, from, to));
		setLinkKeysBySection((keys) => reorder(keys, from, to));
	}

	function moveLink(sectionIndex: number, from: number, to: number) {
		setConfig((current) => ({
			...current,
			sections: current.sections.map((section, i) =>
				i === sectionIndex
					? { ...section, links: reorder(section.links, from, to) }
					: section,
			),
		}));
		setLinkKeysBySection((keys) =>
			keys.map((sectionKeys, i) =>
				i === sectionIndex ? reorder(sectionKeys, from, to) : sectionKeys,
			),
		);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const activeId = String(active.id);
		const overId = String(over.id);

		const sectionFrom = sectionKeys.indexOf(activeId);
		if (sectionFrom !== -1) {
			const sectionTo = sectionKeys.indexOf(overId);
			if (sectionTo !== -1) moveSection(sectionFrom, sectionTo);
			return;
		}

		for (let s = 0; s < linkKeysBySection.length; s++) {
			const linkFrom = linkKeysBySection[s].indexOf(activeId);
			if (linkFrom !== -1) {
				const linkTo = linkKeysBySection[s].indexOf(overId);
				if (linkTo !== -1) moveLink(s, linkFrom, linkTo);
				return;
			}
		}
	}

	const isEdit = mode === "edit";

	return (
		<div className={styles.root}>
			<div
				className={styles.bg}
				style={{ backgroundImage: `url(${config.background.image})` }}
			/>
			<main className={styles.content}>
				<HeaderArea
					title={config.title ?? ""}
					subtitle={config.subtitle ?? ""}
					isEdit={isEdit}
					onTitleChange={updateTitle}
					onSubtitleChange={updateSubtitle}
				/>

				<section className={styles.linksWrap}>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={sectionKeys}
							strategy={verticalListSortingStrategy}
							disabled={!isEdit}
						>
							<div className={styles.sections}>
								{config.sections.map((section, sectionIndex) => (
									<SectionView
										key={sectionKeys[sectionIndex]}
										id={sectionKeys[sectionIndex]}
										section={section}
										linkKeys={linkKeysBySection[sectionIndex] ?? []}
										isEdit={isEdit}
										onLabelChange={(label) =>
											updateSectionLabel(sectionIndex, label)
										}
										onAddLink={() => addLink(sectionIndex)}
										onRemoveLink={(linkIndex) =>
											removeLink(sectionIndex, linkIndex)
										}
										onUpdateLink={(linkIndex, next) =>
											updateLink(sectionIndex, linkIndex, next)
										}
										onRemoveSection={() => removeSection(sectionIndex)}
									/>
								))}
								{isEdit ? (
									<button
										type="button"
										className={styles.addSection}
										onClick={addSection}
									>
										<PlusIcon size={16} />
										<span>Add section</span>
									</button>
								) : null}
							</div>
						</SortableContext>
					</DndContext>
				</section>
			</main>

			{isEdit ? (
				<EditToolbar
					backgroundImage={config.background.image}
					onBackgroundChange={updateBackgroundImage}
					onDiscard={discard}
					onSave={save}
					isPending={isPending}
					error={error}
				/>
			) : (
				<button
					type="button"
					className={styles.editLink}
					onClick={enterEdit}
					aria-label="Edit"
				>
					<PencilIcon />
				</button>
			)}
		</div>
	);
}

function reorder<T>(items: T[], from: number, to: number): T[] {
	if (from === to) return items;
	if (to < 0 || to >= items.length) return items;
	const next = [...items];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}

type HeaderAreaProps = {
	title: string;
	subtitle: string;
	isEdit: boolean;
	onTitleChange: (title: string) => void;
	onSubtitleChange: (subtitle: string) => void;
};

function HeaderArea({
	title,
	subtitle,
	isEdit,
	onTitleChange,
	onSubtitleChange,
}: HeaderAreaProps) {
	if (!isEdit && !title && !subtitle) return null;

	return (
		<header className={styles.header}>
			{isEdit ? (
				<EditableText
					className={styles.title}
					value={title}
					placeholder="Add a title"
					onChange={onTitleChange}
				/>
			) : title ? (
				<h1 className={styles.title}>{title}</h1>
			) : null}
			{isEdit ? (
				<EditableText
					className={styles.sub}
					value={subtitle}
					placeholder="Add a subtitle"
					onChange={onSubtitleChange}
				/>
			) : subtitle ? (
				<p className={styles.sub}>{subtitle}</p>
			) : null}
		</header>
	);
}
