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
	ref: React.Ref<HTMLDivElement>;
	link: QuickLink;
	onChange: (next: QuickLink) => void;
	onRemove: () => void;
	onClose: () => void;
};

export function LinkPopover({ ref, link, onChange, onRemove, onClose }: Props) {
	function setIconField(key: "scale" | "backgroundColor", value: string): void {
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
		<div
			ref={ref}
			className={styles.popover}
			role="dialog"
			aria-label="Edit link"
		>
			<label className={styles.field}>
				<span>Label</span>
				<input
					type="text"
					value={link.label}
					onChange={(event) => onChange({ ...link, label: event.target.value })}
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
				<button type="button" onClick={onClose}>
					Done
				</button>
			</div>
		</div>
	);
}
