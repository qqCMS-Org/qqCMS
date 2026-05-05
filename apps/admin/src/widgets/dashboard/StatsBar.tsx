import type { JSX } from "preact";

// ── Icons ─────────────────────────────────────────────

const IcoPage = (): JSX.Element => (
	<svg
		width={16}
		height={16}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
	>
		<path d="M3 1h7l3 3v11H3V1z" />
		<path d="M10 1v3h3" />
		<line x1="5" y1="7" x2="11" y2="7" />
		<line x1="5" y1="10" x2="9" y2="10" />
	</svg>
);

const IcoLanguage = (): JSX.Element => (
	<svg
		width={16}
		height={16}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
	>
		<circle cx="8" cy="8" r="6" />
		<path d="M2 8h12" />
		<path d="M8 2c-2 2-3 4-3 6s1 4 3 6M8 2c2 2 3 4 3 6s-1 4-3 6" />
	</svg>
);

const IcoMedia = (): JSX.Element => (
	<svg
		width={16}
		height={16}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
	>
		<rect x="1" y="2" width="14" height="12" rx="1" />
		<path d="M1 10l4-4 3 3 2-2 5 5" />
		<circle cx="11" cy="5" r="1.5" fill="currentColor" stroke="none" />
	</svg>
);

// ── Types ─────────────────────────────────────────────

interface StatCardProps {
	label: string;
	value: number;
	href: string;
	color: string;
	Icon: () => JSX.Element;
}

export interface StatsBarProps {
	pagesCount: number;
	languagesCount: number;
	mediaCount: number;
}

// ── StatCard ──────────────────────────────────────────

const StatCard = ({ label, value, href, color, Icon }: StatCardProps): JSX.Element => (
	<a
		href={href}
		style={{
			background: "var(--bg2)",
			border: "1px solid var(--border)",
			borderRadius: 8,
			padding: "20px 18px",
			textDecoration: "none",
			display: "block",
			cursor: "pointer",
		}}
	>
		<div style={{ color, marginBottom: 8, opacity: 0.7 }}>
			<Icon />
		</div>
		<div
			style={{
				fontFamily: "Instrument Serif, serif",
				fontStyle: "italic",
				fontSize: 34,
				color,
				lineHeight: 1,
				marginBottom: 4,
			}}
		>
			{value}
		</div>
		<div style={{ fontSize: 11, color: "var(--text1)", lineHeight: 1.3 }}>{label}</div>
	</a>
);

// ── StatsBar ──────────────────────────────────────────

export const StatsBar = ({ pagesCount, languagesCount, mediaCount }: StatsBarProps): JSX.Element => {
	const cards: StatCardProps[] = [
		{ label: "Total Pages", value: pagesCount, href: "/pages", color: "var(--accent)", Icon: IcoPage },
		{ label: "Languages", value: languagesCount, href: "/languages", color: "var(--green)", Icon: IcoLanguage },
		{ label: "Media Items", value: mediaCount, href: "/media", color: "var(--amber)", Icon: IcoMedia },
	];

	return (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
			{cards.map((card) => (
				<StatCard key={card.label} {...card} />
			))}
		</div>
	);
};
