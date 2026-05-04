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
	return (
		<input
			type="text"
			className={`${styles.input}${className ? ` ${className}` : ""}`}
			value={value}
			placeholder={placeholder}
			aria-label={placeholder}
			onChange={(event) => onChange(event.target.value)}
		/>
	);
}
