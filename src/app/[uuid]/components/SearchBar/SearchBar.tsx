"use client";

import { type FormEvent, useState } from "react";
import type { SearchConfig } from "@/app/types";
import styles from "./styles.module.css";

type Props = {
	config: SearchConfig;
};

export function SearchBar({ config }: Props) {
	const [query, setQuery] = useState("");

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = query.trim();
		if (!trimmed) return;
		const target = config.url.replaceAll("%s", encodeURIComponent(trimmed));
		window.location.assign(target);
	}

	return (
		<form className={styles.root} onSubmit={handleSubmit} role="search">
			<input
				type="search"
				name="q"
				className={styles.input}
				placeholder={config.placeholder ?? "Search"}
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				autoCapitalize="none"
				autoCorrect="off"
				spellCheck={false}
				// biome-ignore lint/a11y/noAutofocus: search is the primary action on this surface
				autoFocus
				aria-label="Search"
			/>
		</form>
	);
}
