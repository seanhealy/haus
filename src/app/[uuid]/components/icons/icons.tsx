type IconProps = { size?: number };

function Svg({
	size = 20,
	children,
}: IconProps & { children: React.ReactNode }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{children}
		</svg>
	);
}

export function PencilIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 20h9" />
			<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
		</Svg>
	);
}

export function XIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</Svg>
	);
}

export function CheckIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<polyline points="20 6 9 17 4 12" />
		</Svg>
	);
}

export function PlusIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</Svg>
	);
}

export function ChevronUpIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<polyline points="18 15 12 9 6 15" />
		</Svg>
	);
}

export function ChevronDownIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<polyline points="6 9 12 15 18 9" />
		</Svg>
	);
}

export function GripIcon({ size = 16 }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<circle cx="9" cy="6" r="1.4" />
			<circle cx="15" cy="6" r="1.4" />
			<circle cx="9" cy="12" r="1.4" />
			<circle cx="15" cy="12" r="1.4" />
			<circle cx="9" cy="18" r="1.4" />
			<circle cx="15" cy="18" r="1.4" />
		</svg>
	);
}
