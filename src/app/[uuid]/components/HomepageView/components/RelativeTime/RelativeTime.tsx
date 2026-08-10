"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";

const REFRESH_MS = 60 * 1000;

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["second", 60],
	["minute", 60],
	["hour", 24],
	["day", 30],
	["month", 12],
];

function relativeLabel(iso: string): string {
	let value = (new Date(iso).getTime() - Date.now()) / 1000;
	for (const [unit, size] of UNITS) {
		if (Math.abs(value) < size) {
			return relativeFormat.format(Math.round(value), unit);
		}
		value /= size;
	}
	return relativeFormat.format(Math.round(value), "year");
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
