import { DeletePageButton } from "@features/pages";
import { useSignal } from "@preact/signals";
import type { JSX } from "preact";

export interface PageRow {
	id: string;
	slug: string;
	isHomepage: boolean;
	createdAt: string;
}

interface PagesTableProps {
	initialPages: PageRow[];
	apiUrl: string;
}

const formatDate = (iso: string): string => {
	const date = new Date(iso);
	return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export function PagesTable({ initialPages, apiUrl }: PagesTableProps): JSX.Element {
	const pages = useSignal<PageRow[]>(initialPages);

	const handleDeleted = (id: string): void => {
		pages.value = pages.value.filter((page) => page.id !== id);
	};

	if (pages.value.length === 0) {
		return (
			<div class="py-16 px-6 text-center text-text2 text-sm">
				No pages yet.{" "}
				<a href="/pages/new" class="text-accent no-underline hover:underline">
					Create the first one
				</a>
				.
			</div>
		);
	}

	return (
		<div class="p-5 px-6">
			<div class="border border-ui-border rounded-lg overflow-hidden">
				<table class="w-full border-collapse text-xs">
					<thead>
						<tr class="bg-bg1 border-b border-ui-border">
							<Th>Slug</Th>
							<Th>Status</Th>
							<Th>Created</Th>
							<Th align="right">Actions</Th>
						</tr>
					</thead>
					<tbody>
						{pages.value.map((page) => (
							<tr key={page.id} class="border-b border-ui-border last:border-0">
								<td class="py-2.5 px-3.5 text-text0 font-medium">/{page.slug}</td>
								<td class="py-2.5 px-3.5">
									{page.isHomepage && (
										<span class="bg-accent text-white rounded text-[10px] font-semibold px-1.5 py-0.5 tracking-[0.04em]">
											HOME
										</span>
									)}
								</td>
								<td class="py-2.5 px-3.5 text-text2">{formatDate(page.createdAt)}</td>
								<td class="py-2.5 px-3.5 text-right">
									<div class="flex gap-1.5 justify-end">
										<a
											href={`/pages/${page.id}/edit`}
											class="border border-ui-border rounded text-text1 text-[11px] px-2 py-1 no-underline hover:border-ui-border-hover"
										>
											Edit
										</a>
										<DeletePageButton pageId={page.id} apiUrl={apiUrl} onDeleted={() => handleDeleted(page.id)} />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

// ── Internal helpers ──────────────────────────────────

interface ThProps {
	children: string;
	align?: "left" | "right";
}

const Th = ({ children, align = "left" }: ThProps): JSX.Element => (
	<th
		class={`py-2 px-3.5 text-text2 font-medium text-[11px] uppercase tracking-[0.03em] ${align === "right" ? "text-right" : "text-left"}`}
	>
		{children}
	</th>
);
