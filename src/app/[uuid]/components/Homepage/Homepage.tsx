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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState, useTransition } from "react";
import type { HomeConfig, QuickLink, Section } from "@/app/types";
import { saveHomepage } from "../../actions";
import { writeSectionsCookie } from "../../sectionsCookie.client";
import { EditableText } from "../EditableText";
import { EditToolbar } from "../EditToolbar";
import { PencilIcon, PlusIcon } from "../icons";
import { SearchBar } from "../SearchBar";
import { SectionView } from "../SectionView";
import styles from "./styles.module.css";

type Props = {
	uuid: string;
	initial: HomeConfig;
	initialOpenSections: Record<string, boolean>;
};

type Mode = "view" | "edit";

function createSection(): Section {
	return { id: crypto.randomUUID(), label: "", links: [] };
}

function createLink(): QuickLink {
	return {
		id: crypto.randomUUID(),
		label: "New link",
		url: "https://example.com",
	};
}

function updateAt<Item>(
	items: Item[],
	index: number,
	update: (item: Item) => Item,
): Item[] {
	return items.map((item, currentIndex) =>
		currentIndex === index ? update(item) : item,
	);
}

function removeAt<Item>(items: Item[], index: number): Item[] {
	return items.filter((_, currentIndex) => currentIndex !== index);
}

export function Homepage({ uuid, initial, initialOpenSections }: Props) {
	const [mode, setMode] = useState<Mode>("view");
	const [config, setConfig] = useState<HomeConfig>(initial);
	const [lastSavedConfig, setLastSavedConfig] = useState<HomeConfig>(initial);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [openSections, setOpenSections] =
		useState<Record<string, boolean>>(initialOpenSections);

	function updateSections(update: (sections: Section[]) => Section[]) {
		setConfig((current) => ({
			...current,
			sections: update(current.sections),
		}));
	}

	function toggleSectionOpen(sectionId: string, open: boolean) {
		setOpenSections((current) => {
			if (current[sectionId] === open) return current;
			const next = { ...current, [sectionId]: open };
			writeSectionsCookie(uuid, next).catch(() => {});
			return next;
		});
	}

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

	function updateSearchUrl(url: string) {
		setConfig((current) => {
			const trimmed = url.trim();
			if (trimmed === "") return { ...current, search: undefined };
			return {
				...current,
				search: { ...current.search, url: trimmed },
			};
		});
	}

	function updateSectionLabel(sectionIndex: number, label: string) {
		updateSections((sections) =>
			updateAt(sections, sectionIndex, (section) => ({ ...section, label })),
		);
	}

	function addSection() {
		updateSections((sections) => [...sections, createSection()]);
	}

	function removeSection(sectionIndex: number) {
		if (!confirm("Remove this section and all its links?")) return;
		updateSections((sections) => removeAt(sections, sectionIndex));
	}

	function updateLink(
		sectionIndex: number,
		linkIndex: number,
		next: QuickLink,
	) {
		updateSections((sections) =>
			updateAt(sections, sectionIndex, (section) => ({
				...section,
				links: updateAt(section.links, linkIndex, (existing) => ({
					...next,
					id: existing.id,
				})),
			})),
		);
	}

	function addLink(sectionIndex: number) {
		updateSections((sections) =>
			updateAt(sections, sectionIndex, (section) => ({
				...section,
				links: [...section.links, createLink()],
			})),
		);
	}

	function removeLink(sectionIndex: number, linkIndex: number) {
		updateSections((sections) =>
			updateAt(sections, sectionIndex, (section) => ({
				...section,
				links: removeAt(section.links, linkIndex),
			})),
		);
	}

	function moveSection(from: number, to: number) {
		updateSections((sections) => reorder(sections, from, to));
	}

	function moveLink(sectionIndex: number, from: number, to: number) {
		updateSections((sections) =>
			updateAt(sections, sectionIndex, (section) => ({
				...section,
				links: reorder(section.links, from, to),
			})),
		);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const activeId = String(active.id);
		const overId = String(over.id);

		const sectionIndex = config.sections.findIndex((section) =>
			section.links.some((link) => link.id === activeId),
		);
		if (sectionIndex === -1) return;
		const links = config.sections[sectionIndex].links;
		const linkFrom = links.findIndex((link) => link.id === activeId);
		const linkTo = links.findIndex((link) => link.id === overId);
		if (linkTo === -1) return;
		moveLink(sectionIndex, linkFrom, linkTo);
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

				{!isEdit && config.search ? <SearchBar config={config.search} /> : null}

				<section className={styles.linksWrap}>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<div className={styles.sections}>
							{config.sections.map((section, sectionIndex) => (
								<SectionView
									key={section.id}
									section={section}
									isEdit={isEdit}
									open={openSections[section.id] ?? true}
									onOpenChange={(open) => toggleSectionOpen(section.id, open)}
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
									onMoveUp={() => moveSection(sectionIndex, sectionIndex - 1)}
									onMoveDown={() => moveSection(sectionIndex, sectionIndex + 1)}
									canMoveUp={sectionIndex > 0}
									canMoveDown={sectionIndex < config.sections.length - 1}
								/>
							))}
							{isEdit ? (
								<>
									<button
										type="button"
										className={styles.addSection}
										onClick={addSection}
									>
										<span>Add section</span>
										<PlusIcon size={16} />
									</button>
									<EditToolbar
										backgroundImage={config.background.image}
										onBackgroundChange={updateBackgroundImage}
										searchUrl={config.search?.url ?? ""}
										onSearchUrlChange={updateSearchUrl}
										onDiscard={discard}
										onSave={save}
										isPending={isPending}
										error={error}
									/>
								</>
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
					</DndContext>
				</section>
			</main>
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
