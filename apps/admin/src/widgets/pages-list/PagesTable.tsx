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
			<div
				style={{
					padding: "60px 24px",
					textAlign: "center",
					color: "var(--text2)",
					fontSize: 13,
				}}
			>
				No pages yet.{" "}
				<a href="/pages/new" style={{ color: "var(--accent)", textDecoration: "none" }}>
					Create the first one
				</a>
				.
			</div>
		);
	}

	return (
		<div style={{ padding: "20px 24px" }}>
			<div
				style={{
					border: "1px solid var(--border)",
					borderRadius: 8,
					overflow: "hidden",
				}}
			>
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						fontSize: 12,
					}}
				>
					<thead>
						<tr style={{ background: "var(--bg1, var(--bg2))", borderBottom: "1px solid var(--border)" }}>
							<Th>Slug</Th>
							<Th>Status</Th>
							<Th>Created</Th>
							<Th align="right">Actions</Th>
						</tr>
					</thead>
					<tbody>
						{pages.value.map((page, index) => (
							<tr
								key={page.id}
								style={{
									borderBottom: index < pages.value.length - 1 ? "1px solid var(--border)" : "none",
									background: "transparent",
								}}
							>
								<td style={{ padding: "10px 14px", color: "var(--text0)", fontWeight: 500 }}>/{page.slug}</td>
								<td style={{ padding: "10px 14px" }}>
									{page.isHomepage && (
										<span
											style={{
												background: "var(--accent)",
												color: "#fff",
												borderRadius: 3,
												padding: "2px 6px",
												fontSize: 10,
												fontWeight: 600,
												letterSpacing: "0.04em",
											}}
										>
											HOME
										</span>
									)}
								</td>
								<td style={{ padding: "10px 14px", color: "var(--text2)" }}>{formatDate(page.createdAt)}</td>
								<td style={{ padding: "10px 14px", textAlign: "right" }}>
									<div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
										<a
											href={`/pages/${page.id}/edit`}
											style={{
												border: "1px solid var(--border)",
												borderRadius: 4,
												padding: "3px 8px",
												color: "var(--text1)",
												fontSize: 11,
												textDecoration: "none",
											}}
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
		style={{
			padding: "8px 14px",
			textAlign: align,
			color: "var(--text2)",
			fontWeight: 500,
			fontSize: 11,
			letterSpacing: "0.03em",
			textTransform: "uppercase",
		}}
	>
		{children}
	</th>
);
