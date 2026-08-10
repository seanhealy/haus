import Link from "next/link";
import { notFound } from "next/navigation";
import { HomepageRepository } from "@/db/repositories";
import { isUuid } from "@/utilities/isUuid";
import { describeChanges } from "./changes";
import { LocalTime } from "./components/LocalTime";
import styles from "./styles.module.css";

type Props = {
	params: Promise<{ uuid: string }>;
};

const PAGE_SIZE = 25;

export default async function HistoryPage({ params }: Props) {
	const { uuid } = await params;
	if (!isUuid(uuid)) notFound();

	const homepage = await HomepageRepository.findById(uuid);
	if (!homepage) notFound();

	const rows = await HomepageRepository.listRevisions(uuid, PAGE_SIZE + 1);
	const truncated = rows.length > PAGE_SIZE;

	const entries = rows
		.map((revision, index) => {
			const previous = rows[index - 1];
			return {
				id: revision.id,
				createdAt: revision.createdAt,
				changes: previous
					? describeChanges(previous.config, revision.config)
					: null,
			};
		})
		.slice(truncated ? 1 : 0)
		.reverse();

	return (
		<main className={styles.root}>
			<header className={styles.header}>
				<h1 className={styles.title}>History</h1>
				<Link className={styles.back} href={`/${uuid}`}>
					Back to homepage
				</Link>
			</header>

			{entries.length === 0 ? (
				<p className={styles.empty}>
					No history yet. Changes are recorded from your next save.
				</p>
			) : (
				<ol className={styles.entries}>
					{entries.map((entry) => (
						<li key={entry.id} className={styles.entry}>
							<LocalTime
								className={styles.time}
								iso={entry.createdAt.toISOString()}
							/>
							{entry.changes === null ? (
								<p className={styles.note}>Created</p>
							) : entry.changes.length === 0 ? (
								<p className={styles.note}>Saved with no changes</p>
							) : (
								<ul className={styles.changes}>
									{entry.changes.map((change, index) => (
										<li
											key={`${change.kind}-${index}`}
											className={styles[change.kind]}
										>
											{change.description}
										</li>
									))}
								</ul>
							)}
						</li>
					))}
				</ol>
			)}

			{truncated ? (
				<p className={styles.note}>
					Showing the {PAGE_SIZE} most recent changes.
				</p>
			) : null}
		</main>
	);
}
