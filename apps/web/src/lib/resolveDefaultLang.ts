import { api } from "@shared/api/client";

export function parseAcceptLanguage(header: string | null): string[] {
	if (!header) return [];
	return header
		.split(",")
		.map((part) => {
			const [lang, q] = part.trim().split(";q=");
			return { code: lang.trim().split("-")[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
		})
		.sort((a, b) => b.q - a.q)
		.map((x) => x.code);
}

export async function resolveDefaultLang(acceptLanguageHeader: string | null): Promise<string> {
	try {
		const langsRes = await api.languages.get();
		if (langsRes.error) return "en";

		const activeLangs = langsRes.data.filter((l) => l.isActive);
		const preferred = parseAcceptLanguage(acceptLanguageHeader);
		const matched = preferred.find((code) => activeLangs.some((l) => l.code === code));
		const defaultLang = activeLangs.find((l) => l.isDefault)?.code ?? activeLangs[0]?.code ?? "en";
		return matched ?? defaultLang;
	} catch {
		return "en";
	}
}
