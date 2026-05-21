"use client";

import { useEffect, useRef } from "react";
import { setSectionOpen } from "../../sectionsCookie.client";

type Props = {
	uuid: string;
	sectionId: string;
};

// The <details> collapses natively with no JS. This island's only job is to
// remember the choice: it listens for the parent's toggle and writes the
// cookie. It renders an empty anchor so it can find the <details> it lives in.
export function SectionOpenPersister({ uuid, sectionId }: Props) {
	const anchor = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const details = anchor.current?.closest("details");
		if (!details) return;

		const persist = () => {
			setSectionOpen(uuid, sectionId, details.open).catch(() => {});
		};

		details.addEventListener("toggle", persist);
		return () => details.removeEventListener("toggle", persist);
	}, [uuid, sectionId]);

	return <span ref={anchor} hidden />;
}
