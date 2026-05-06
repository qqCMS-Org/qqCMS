import { useSignal } from "@preact/signals";
import type { JSX } from "preact";

export interface PageRow {
	id: string;
	slug: string;
	status: "draft" | "published";
	isHomepage: boolean;
	title: string | null;
	createdAt: string;
	updatedAt: string;
}

interface PagesTableProps {
	initialPages: PageRow[];
}

const timeAgo = (iso: string): string => {
	const ms = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(ms / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.floor(hrs / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export function PagesTable({ initialPages }: PagesTableProps): JSX.Element {
	const pages = useSignal<PageRow[]>(initialPages);

	if (pages.value.length === 0) {
		return (
			<div class="py-16 text-center text-text2 text-xs">
				No pages yet.{" "}
				<a href="/pages/new" class="text-accent no-underline hover:underline">
					Create the first one
				</a>
				.
			</div>
		);
	}

	return (
		<div class="flex-1 overflow-y-auto bg-bg1 p-5">
			<div class="flex gap-2 text-[11px] text-text2 mb-4">
				<span>{pages.value.length} pages</span>
				<span>·</span>
				<span class="text-green">{pages.value.filter((page) => page.status === "published").length} published</span>
				<span>·</span>
				<span class="text-amber">{pages.value.filter((page) => page.status === "draft").length} draft</span>
			</div>
			<div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
				{pages.value.map((page) => (
					<a
						key={page.id}
						href={`/pages/${page.id}/edit`}
						class="bg-bg2 border border-ui-border rounded-lg p-4 no-underline block hover:border-ui-border-hover transition-colors"
					>
						<div class="text-[10px] text-green font-mono mb-2.5">
							{page.slug.startsWith("/") ? page.slug : `/${page.slug}`}
						</div>
						<div class="font-serif italic text-text0 mb-3.5" style="font-size: 22px; line-height: 1.2">
							{page.title ?? <span class="text-text2">Untitled</span>}
						</div>
						<div class="flex justify-between items-center">
							<StatusBadge status={page.status} />
							<span class="text-[10px] text-text2">Updated {timeAgo(page.updatedAt)}</span>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

// ── Internal helpers ──────────────────────────────────

const StatusBadge = ({ status }: { status: "draft" | "published" }): JSX.Element =>
	status === "published" ? (
		<span class="inline-flex items-center gap-1 bg-green-faint text-green text-[10px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
			<span class="w-1 h-1 rounded-full bg-green shrink-0" />
			PUBLISHED
		</span>
	) : (
		<span class="inline-flex items-center gap-1 bg-amber-faint text-amber text-[10px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
			<span class="w-1 h-1 rounded-full bg-amber shrink-0" />
			DRAFT
		</span>
	);
