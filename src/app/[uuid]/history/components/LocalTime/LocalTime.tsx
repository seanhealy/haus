"use client";

import { useEffect, useState } from "react";

const utcFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "UTC",
});

const localFormat = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short",
});

type Props = {
	iso: string;
	className?: string;
};

export function LocalTime({ iso, className }: Props) {
	const [label, setLabel] = useState(
		() => `${utcFormat.format(new Date(iso))} UTC`,
	);

	useEffect(() => {
		setLabel(localFormat.format(new Date(iso)));
	}, [iso]);

	return (
		<time className={className} dateTime={iso} title={iso}>
			{label}
		</time>
	);
}
