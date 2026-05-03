"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { QuickLinkIcon } from "@/app/components/QuickLinkIcon";
import type { HomeConfig, QuickLink } from "@/app/types";
import { saveHomepage } from "../actions";

const PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i;

function normalizeUrl(value: string): string {
	const trimmed = value.trim();
	if (trimmed === "") return trimmed;
	if (trimmed.startsWith("/")) return trimmed;
	if (PROTOCOL_PATTERN.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

type Props = {
	uuid: string;
	initial: HomeConfig;
};

export function HomepageEditor({ uuid, initial }: Props) {
	const [config, setConfig] = useState<HomeConfig>(initial);
	const [linkKeys, setLinkKeys] = useState<string[]>(() =>
		initial.quickLinks.map(() => crypto.randomUUID()),
	);
	const [lastSavedConfig, setLastSavedConfig] = useState<HomeConfig>(initial);
	const [error, setError] = useState<string | null>(null);
	const [savedAt, setSavedAt] = useState<number | null>(null);
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

	function updateBackgroundImage(image: string) {
		setConfig((current) => ({ ...current, background: { image } }));
	}

	function updateLink(index: number, next: QuickLink) {
		setConfig((current) => ({
			...current,
			quickLinks: current.quickLinks.map((link, i) =>
				i === index ? next : link,
			),
		}));
	}

	function addLink() {
		setConfig((current) => ({
			...current,
			quickLinks: [...current.quickLinks, { label: "", url: "" }],
		}));
		setLinkKeys((keys) => [...keys, crypto.randomUUID()]);
	}

	function removeLink(index: number) {
		setConfig((current) => ({
			...current,
			quickLinks: current.quickLinks.filter((_, i) => i !== index),
		}));
		setLinkKeys((keys) => keys.filter((_, i) => i !== index));
	}

	function moveLink(from: number, to: number) {
		setConfig((current) => {
			if (to < 0 || to >= current.quickLinks.length) return current;
			const next = [...current.quickLinks];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return { ...current, quickLinks: next };
		});
		setLinkKeys((keys) => {
			if (to < 0 || to >= keys.length) return keys;
			const next = [...keys];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return next;
		});
	}

	function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		const snapshot = config;
		startTransition(async () => {
			const result = await saveHomepage(uuid, snapshot);
			if (result.ok) {
				setLastSavedConfig(snapshot);
				setSavedAt(Date.now());
			} else {
				setError(result.error);
			}
		});
	}

	const showSaved = !isDirty && savedAt !== null;

	return (
		<main className="editor">
			<header className="editor-header">
				<h1>Edit homepage</h1>
				<Link className="editor-link" href={`/${uuid}`}>
					View
				</Link>
			</header>

			<form className="editor-form" onSubmit={onSubmit}>
				<section className="editor-section">
					<h2>Background</h2>
					<label className="field">
						<span>Image URL</span>
						<input
							type="url"
							value={config.background.image}
							onChange={(event) => updateBackgroundImage(event.target.value)}
							onBlur={(event) =>
								updateBackgroundImage(normalizeUrl(event.target.value))
							}
							required
						/>
					</label>
				</section>

				<section className="editor-section">
					<div className="editor-section-head">
						<h2>Quick links</h2>
						<button type="button" onClick={addLink}>
							Add link
						</button>
					</div>
					{config.quickLinks.length === 0 ? (
						<p className="editor-empty">No quick links.</p>
					) : (
						<ul className="editor-links">
							{config.quickLinks.map((link, index) => (
								<QuickLinkRow
									key={linkKeys[index]}
									link={link}
									onChange={(next) => updateLink(index, next)}
									onRemove={() => removeLink(index)}
									onMoveUp={() => moveLink(index, index - 1)}
									onMoveDown={() => moveLink(index, index + 1)}
									canMoveUp={index > 0}
									canMoveDown={index < config.quickLinks.length - 1}
								/>
							))}
						</ul>
					)}
				</section>

				<div className="editor-actions">
					<button type="submit" disabled={isPending || !isDirty}>
						{isPending ? "Saving…" : "Save"}
					</button>
					{error ? <span className="editor-error">{error}</span> : null}
					{!error && showSaved ? (
						<span className="editor-saved">Saved</span>
					) : null}
				</div>
			</form>
		</main>
	);
}

type QuickLinkRowProps = {
	link: QuickLink;
	onChange: (next: QuickLink) => void;
	onRemove: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
};

function QuickLinkRow({
	link,
	onChange,
	onRemove,
	onMoveUp,
	onMoveDown,
	canMoveUp,
	canMoveDown,
}: QuickLinkRowProps) {
	function setIconField<K extends "scale" | "backgroundColor">(
		key: K,
		value: string,
	) {
		const trimmed = value.trim();
		const currentIcon = link.icon ?? {};
		const { scale, backgroundColor } = currentIcon;
		const nextIcon = { scale, backgroundColor };

		if (trimmed === "") {
			nextIcon[key] = undefined;
		} else if (key === "scale") {
			const parsed = Number(trimmed);
			if (Number.isNaN(parsed)) return;
			nextIcon.scale = parsed;
		} else {
			nextIcon.backgroundColor = trimmed;
		}

		const cleaned: QuickLink["icon"] =
			nextIcon.scale === undefined && nextIcon.backgroundColor === undefined
				? undefined
				: {
						...(nextIcon.scale !== undefined ? { scale: nextIcon.scale } : {}),
						...(nextIcon.backgroundColor !== undefined
							? { backgroundColor: nextIcon.backgroundColor }
							: {}),
					};

		onChange({ ...link, icon: cleaned });
	}

	return (
		<li className="editor-link-row">
			<QuickLinkIcon url={link.url} icon={link.icon} />
			<div className="editor-link-grid">
				<label className="field">
					<span>Label</span>
					<input
						type="text"
						value={link.label}
						onChange={(event) =>
							onChange({ ...link, label: event.target.value })
						}
						required
					/>
				</label>
				<label className="field">
					<span>URL</span>
					<input
						type="url"
						value={link.url}
						onChange={(event) => onChange({ ...link, url: event.target.value })}
						onBlur={(event) =>
							onChange({ ...link, url: normalizeUrl(event.target.value) })
						}
						required
					/>
				</label>
				<label className="field">
					<span>Icon scale</span>
					<input
						type="number"
						step="0.05"
						min="0"
						value={link.icon?.scale ?? ""}
						onChange={(event) => setIconField("scale", event.target.value)}
					/>
				</label>
				<label className="field">
					<span>Icon background</span>
					<input
						type="text"
						placeholder="#f3f6f8"
						value={link.icon?.backgroundColor ?? ""}
						onChange={(event) =>
							setIconField("backgroundColor", event.target.value)
						}
					/>
				</label>
			</div>
			<div className="editor-row-actions">
				<button
					type="button"
					onClick={onMoveUp}
					disabled={!canMoveUp}
					aria-label="Move up"
				>
					Up
				</button>
				<button
					type="button"
					onClick={onMoveDown}
					disabled={!canMoveDown}
					aria-label="Move down"
				>
					Down
				</button>
				<button type="button" className="editor-remove" onClick={onRemove}>
					Remove
				</button>
			</div>
		</li>
	);
}
