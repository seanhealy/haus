import { useEffect, useRef } from "react";
import type { QuickLink } from "@/app/types";
import styles from "./styles.module.css";

const PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i;

function normalizeUrl(value: string): string {
	const trimmed = value.trim();
	if (trimmed === "") return trimmed;
	if (trimmed.startsWith("/")) return trimmed;
	if (PROTOCOL_PATTERN.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

type Props = {
	open: boolean;
	link: QuickLink;
	onChange: (next: QuickLink) => void;
	onRemove: () => void;
	onClose: () => void;
};

export function LinkPopover({
	open,
	link,
	onChange,
	onRemove,
	onClose,
}: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		function handleClick(event: MouseEvent) {
			if (event.target === dialog) onClose();
		}
		dialog.addEventListener("click", handleClick);
		return () => dialog.removeEventListener("click", handleClick);
	}, [onClose]);

	function setIconField(
		key: "scale" | "backgroundColor" | "image",
		value: string,
	): void {
		const trimmed = value.trim();
		const currentIcon = link.icon ?? {};
		const next: NonNullable<QuickLink["icon"]> = {
			scale: currentIcon.scale,
			backgroundColor: currentIcon.backgroundColor,
			image: currentIcon.image,
		};

		if (trimmed === "") {
			next[key] = undefined;
		} else if (key === "scale") {
			const parsed = Number(trimmed);
			if (Number.isNaN(parsed)) return;
			next.scale = parsed;
		} else if (key === "backgroundColor") {
			next.backgroundColor = trimmed;
		} else {
			next.image = trimmed;
		}

		const cleaned: NonNullable<QuickLink["icon"]> = {};
		if (next.scale !== undefined) cleaned.scale = next.scale;
		if (next.backgroundColor !== undefined)
			cleaned.backgroundColor = next.backgroundColor;
		if (next.image !== undefined) cleaned.image = next.image;

		onChange({
			...link,
			icon: Object.keys(cleaned).length > 0 ? cleaned : undefined,
		});
	}

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-label="Edit link"
			onClose={onClose}
			onKeyDown={(event) => event.stopPropagation()}
		>
			<form method="dialog" className={styles.content}>
				<label className={styles.field}>
					<span>Label</span>
					<input
						type="text"
						value={link.label}
						onChange={(event) =>
							onChange({ ...link, label: event.target.value })
						}
					/>
				</label>
				<label className={styles.field}>
					<span>URL</span>
					<input
						type="text"
						value={link.url}
						onChange={(event) => onChange({ ...link, url: event.target.value })}
						onBlur={(event) =>
							onChange({ ...link, url: normalizeUrl(event.target.value) })
						}
					/>
				</label>
				<label className={styles.field}>
					<span>Icon image URL</span>
					<input
						type="text"
						placeholder="leave blank to auto-fetch"
						value={link.icon?.image ?? ""}
						onChange={(event) => setIconField("image", event.target.value)}
						onBlur={(event) =>
							setIconField("image", normalizeUrl(event.target.value))
						}
					/>
				</label>
				<label className={styles.field}>
					<span>Icon scale</span>
					<input
						type="number"
						step="0.05"
						min="0"
						value={link.icon?.scale ?? ""}
						onChange={(event) => setIconField("scale", event.target.value)}
					/>
				</label>
				<label className={styles.field}>
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
				<div className={styles.actions}>
					<button type="button" className={styles.remove} onClick={onRemove}>
						Remove
					</button>
					<button type="submit">Done</button>
				</div>
			</form>
		</dialog>
	);
}
