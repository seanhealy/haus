import { CheckIcon, XIcon } from "../icons";
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
	backgroundImage: string;
	onBackgroundChange: (value: string) => void;
	onDiscard: () => void;
	onSave: () => void;
	isPending: boolean;
	error: string | null;
};

export function EditToolbar({
	backgroundImage,
	onBackgroundChange,
	onDiscard,
	onSave,
	isPending,
	error,
}: Props) {
	return (
		<div className={styles.toolbar} role="toolbar" aria-label="Edit toolbar">
			<label className={styles.field}>
				<span>Background</span>
				<input
					type="text"
					value={backgroundImage}
					onChange={(event) => onBackgroundChange(event.target.value)}
					onBlur={(event) =>
						onBackgroundChange(normalizeUrl(event.target.value))
					}
				/>
			</label>
			{error ? <span className={styles.error}>{error}</span> : null}
			<button
				type="button"
				className={styles.button}
				onClick={onDiscard}
				disabled={isPending}
				aria-label="Discard changes"
			>
				<XIcon />
			</button>
			<button
				type="button"
				className={`${styles.button} ${styles.save}`}
				onClick={onSave}
				disabled={isPending}
				aria-label="Save changes"
			>
				<CheckIcon />
			</button>
		</div>
	);
}
