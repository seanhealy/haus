"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";

const REFRESH_MS = 60 * 1000;

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 60 * 60 * 24 * 365],
	["month", 60 * 60 * 24 * 30],
	["day", 60 * 60 * 24],
	["hour", 60 * 60],
	["minute", 60],
	["second", 1],
];

function relativeLabel(iso: string): string {
	const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
	const [unit, perUnit]: [Intl.RelativeTimeFormatUnit, number] = DIVISIONS.find(
		([, size]) => Math.abs(seconds) >= size,
	) ?? ["second", 1];
	return relativeFormat.format(Math.round(seconds / perUnit), unit);
}

export function RelativeTime({ iso }: { iso: string }) {
	const [relative, setRelative] = useState<string | null>(null);

	useEffect(() => {
		const update = () => setRelative(relativeLabel(iso));
		update();
		const interval = setInterval(update, REFRESH_MS);
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
