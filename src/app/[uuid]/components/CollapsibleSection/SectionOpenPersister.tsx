"use client";

import { useEffect, useRef } from "react";
import { readSectionsState, setSectionOpen } from "../../sectionsCookie.client";

type Props = {
	uuid: string;
	sectionId: string;
};

// Restores the saved state on mount (covers soft navigations, where the
// pre-paint script doesn't run) and writes the cookie on toggle. The empty
// anchor exists only to locate the parent <details>.
export function SectionOpenPersister({ uuid, sectionId }: Props) {
	const anchor = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const details = anchor.current?.closest("details");
		if (!details) return;

		const saved = readSectionsState(uuid)[sectionId] ?? true;
		if (details.open !== saved) details.open = saved;

		const persist = () => {
			setSectionOpen(uuid, sectionId, details.open).catch(() => {});
		};

		details.addEventListener("toggle", persist);
		return () => details.removeEventListener("toggle", persist);
	}, [uuid, sectionId]);

	return <span ref={anchor} hidden />;
}
