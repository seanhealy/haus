import Image from "next/image";
import type { HomeConfig, QuickLink } from "../types";

type Props = {
	config: HomeConfig;
};

type QuickLinksProps = {
	links: QuickLink[];
};

function QuickLinks({ links }: QuickLinksProps) {
	if (!links || links.length === 0) {
		return <div className="quicklinks-empty">No quick links configured.</div>;
	}

	return (
		<nav className="quicklinks" aria-label="Quick links">
			{links.map((link) => (
				<a className="quicklink" key={link.url} href={link.url}>
					<span className="quicklink-icon-wrap">
						<span
							className="quicklink-icon-tile"
							style={
								link.icon?.backgroundColor
									? { background: link.icon.backgroundColor }
									: undefined
							}
						>
							<Image
								className="quicklink-icon"
								src={iconUrlFor(link.url)}
								alt=""
								width={64}
								height={64}
								unoptimized
								loading="eager"
								style={
									link.icon?.scale
										? { transform: `scale(${link.icon.scale})` }
										: undefined
								}
							/>
						</span>
					</span>
					<span className="quicklink-label">{link.label}</span>
				</a>
			))}
		</nav>
	);
}

function iconUrlFor(linkUrl: string): string {
	try {
		return `https://icon.horse/icon/${new URL(linkUrl).host}`;
	} catch {
		return "";
	}
}

export function Homepage({ config }: Props) {
	const bgStyle = {
		backgroundImage: `url(${config.background.image})`,
	};

	return (
		<div className="hp-root">
			<div className="hp-bg" style={bgStyle} />
			<main className="hp-content">
				<header className="hp-header">
					<h1 className="hp-title">Welcome</h1>
					<p className="hp-sub">Start your session</p>
				</header>

				<section className="hp-links">
					<QuickLinks links={config.quickLinks} />
				</section>
			</main>
		</div>
	);
}
