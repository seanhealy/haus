"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: {
	limit: number;
	unit: Intl.RelativeTimeFormatUnit;
	ms: number;
}[] = [
	{ limit: 60, unit: "second", ms: 1000 },
	{ limit: 60, unit: "minute", ms: 1000 * 60 },
	{ limit: 24, unit: "hour", ms: 1000 * 60 * 60 },
	{ limit: 30, unit: "day", ms: 1000 * 60 * 60 * 24 },
	{ limit: 12, unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
	{
		limit: Number.POSITIVE_INFINITY,
		unit: "year",
		ms: 1000 * 60 * 60 * 24 * 365,
	},
];

function relativeLabel(iso: string): string {
	const diff = new Date(iso).getTime() - Date.now();
	for (const { limit, unit, ms } of DIVISIONS) {
		const value = diff / ms;
		if (Math.abs(value) < limit) {
			return relativeFormat.format(Math.round(value), unit);
		}
	}
	return iso;
}

export function RelativeTime({ iso }: { iso: string }) {
	const [relative, setRelative] = useState<string | null>(null);

	useEffect(() => {
		const update = () => setRelative(relativeLabel(iso));
		update();
		const interval = setInterval(update, 60_000);
		return () => clearInterval(interval);
	}, [iso]);

	if (relative === null) {
		return <span className={styles.skeleton} aria-hidden="true" />;
	}

	return (
		<time dateTime={iso} title={iso}>
			Last edited {relative}
		</time>
	);
}
