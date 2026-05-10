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
	searchUrl: string;
	onSearchUrlChange: (value: string) => void;
	onDiscard: () => void;
	onSave: () => void;
	isPending: boolean;
	error: string | null;
};

export function EditToolbar({
	backgroundImage,
	onBackgroundChange,
	searchUrl,
	onSearchUrlChange,
	onDiscard,
	onSave,
	isPending,
	error,
}: Props) {
	return (
		<>
			<UrlField
				label="PageBackground"
				value={backgroundImage}
				onChange={onBackgroundChange}
			/>
			<UrlField
				label="SearchEngine (use %s for the query)"
				value={searchUrl}
				placeholder="https://kagi.com/search?q=%s"
				onChange={onSearchUrlChange}
			/>
			{error ? <span className={styles.error}>{error}</span> : null}
			<div className={styles.actions}>
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
					className={styles.button}
					onClick={onSave}
					disabled={isPending}
					aria-label="Save changes"
				>
					<CheckIcon />
				</button>
			</div>
		</>
	);
}

type UrlFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

function UrlField({ label, value, onChange, placeholder }: UrlFieldProps) {
	return (
		<label className={styles.field}>
			<span>{label}</span>
			<input
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={(event) => onChange(event.target.value)}
				onBlur={(event) => onChange(normalizeUrl(event.target.value))}
			/>
		</label>
	);
}
