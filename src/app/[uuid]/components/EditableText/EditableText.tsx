import { useEffect, useRef } from "react";
import { PencilIcon } from "../icons";
import styles from "./styles.module.css";

type Props = {
	className?: string;
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
};

export function EditableText({
	className,
	value,
	placeholder,
	onChange,
}: Props) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		if ((node.textContent ?? "") !== value) {
			node.textContent = value;
		}
	}, [value]);

	function handleInput() {
		const next = ref.current?.textContent ?? "";
		if (next !== value) onChange(next);
	}

	function focus() {
		ref.current?.focus();
	}

	return (
		<span className={`${styles.wrap}${className ? ` ${className}` : ""}`}>
			<span
				ref={ref}
				className={`${styles.text}${value ? "" : ` ${styles.empty}`}`}
				contentEditable
				suppressContentEditableWarning
				role="textbox"
				tabIndex={0}
				aria-label={placeholder}
				data-placeholder={placeholder}
				onInput={handleInput}
			/>
			<button
				type="button"
				className={styles.editButton}
				onClick={focus}
				aria-label="Edit"
			>
				<PencilIcon size={12} />
			</button>
		</span>
	);
}
