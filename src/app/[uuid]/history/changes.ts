import { create } from "jsondiffpatch";
import { format, type Op, patch } from "jsondiffpatch/formatters/jsonpatch";
import type { HomeConfig } from "@/app/types";

export type ChangeKind = "added" | "removed" | "moved" | "changed";
export type Change = { kind: ChangeKind; description: string };

const differ = create({
	objectHash: (item) => {
		const id = (item as { id?: unknown }).id;
		return typeof id === "string" ? id : undefined;
	},
});

export function describeChanges(
	before: HomeConfig,
	after: HomeConfig,
): Change[] {
	const delta = differ.diff(before, after);
	if (!delta) return [];

	const working = structuredClone(before);
	return format(delta).map((op) => {
		if (op.op === "add") {
			patch(working, [op]);
			return describeOp(op, working);
		}
		const change = describeOp(op, working);
		patch(working, [op]);
		return change;
	});
}

function describeOp(op: Op, document: HomeConfig): Change {
	switch (op.op) {
		case "add":
			return {
				kind: "added",
				description: `Added ${target(op.path, document)}`,
			};
		case "remove":
			return {
				kind: "removed",
				description: `Removed ${target(op.path, document)}`,
			};
		case "move":
			return {
				kind: "moved",
				description: `Reordered ${target(op.from, document)}`,
			};
		case "replace":
			return {
				kind: "changed",
				description: `Changed ${target(op.path, document)}${preview(op.value)}`,
			};
	}
}

function target(pointer: string, document: HomeConfig): string {
	const segments = pointer.split("/").slice(1);
	if (segments[0] === "sections") {
		return describeSection(segments.slice(1), document);
	}
	return `the ${segments.map(humanize).join(" ")}`;
}

function describeSection(rest: string[], document: HomeConfig): string {
	const [index, field, linkIndex, ...linkPath] = rest;
	const section = document.sections?.[Number(index)];
	const sectionName = section?.label ? `“${section.label}”` : "a section";

	if (field === "links") {
		const link = section?.links?.[Number(linkIndex)];
		const linkName = link?.label ? `“${link.label}”` : "a link";
		const container = `link ${linkName} in section ${sectionName}`;
		return linkPath.length
			? `the ${linkPath.map(humanize).join(" ")} of ${container}`
			: container;
	}

	return field
		? `the ${humanize(field)} of section ${sectionName}`
		: `section ${sectionName}`;
}

function humanize(field: string): string {
	return field.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

function preview(value: unknown): string {
	if (typeof value === "string") {
		const trimmed = value.length > 40 ? `${value.slice(0, 40)}…` : value;
		return ` to “${trimmed}”`;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return ` to ${value}`;
	}
	return "";
}
