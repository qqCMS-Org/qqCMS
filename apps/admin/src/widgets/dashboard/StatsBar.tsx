import { FileText, Globe, Image, type LucideIcon } from "lucide-preact";

// ── Types ─────────────────────────────────────────────

interface StatCardProps {
	label: string;
	value: number;
	href: string;
	colorClass: string;
	Icon: LucideIcon;
}

export interface StatsBarProps {
	pagesCount: number;
	languagesCount: number;
	mediaCount: number;
}

// ── Config ────────────────────────────────────────────

type StatCardConfig = Omit<StatCardProps, "value">;

const STAT_CARDS: StatCardConfig[] = [
	{ label: "Total Pages", href: "/pages", colorClass: "text-accent", Icon: FileText },
	{ label: "Languages", href: "/languages", colorClass: "text-green", Icon: Globe },
	{ label: "Media Items", href: "/media", colorClass: "text-amber", Icon: Image },
];

// ── StatCard ──────────────────────────────────────────

const StatCard = ({ label, value, href, colorClass, Icon }: StatCardProps) => (
	<a href={href} class="block bg-bg2 border border-ui-border rounded-lg p-[20px_18px] no-underline cursor-pointer">
		<div class={`mb-2 opacity-70 ${colorClass}`}>
			<Icon size={16} />
		</div>
		<div class={`font-serif italic text-[34px] leading-none mb-1 ${colorClass}`}>{value}</div>
		<div class="text-[11px] text-text1 leading-snug">{label}</div>
	</a>
);

// ── StatsBar ──────────────────────────────────────────

export const StatsBar = ({ pagesCount, languagesCount, mediaCount }: StatsBarProps) => {
	const counts = [pagesCount, languagesCount, mediaCount];

	return (
		<div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1 max-sm:gap-2">
			{STAT_CARDS.map((config, index) => (
				<StatCard key={config.label} {...config} value={counts[index]} />
			))}
		</div>
	);
};
