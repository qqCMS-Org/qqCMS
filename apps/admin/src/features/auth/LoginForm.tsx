import { useSignal } from "@preact/signals";
import { api } from "@shared/api/client";
import { Button } from "@repo/ui/Button";
import { Input } from "@repo/ui/Input";
import { Card } from "@repo/ui/Card";
import { Logo } from "@repo/ui/Logo";

export function LoginForm() {
	const login = useSignal("");
	const password = useSignal("");
	const error = useSignal("");
	const loading = useSignal(false);
	const showPass = useSignal(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!login.value || !password.value) {
			error.value = "Please fill in all fields.";
			return;
		}

		loading.value = true;
		error.value = "";

		try {
			const { data, error: apiError } = await api.auth.login.post({
				login: login.value,
				password: password.value,
			});

			if (apiError) {
				// The API returns { error: string, code: string } for errors
				error.value = (apiError.value as { error?: string })?.error || "Invalid credentials";
			} else if (data?.ok) {
				window.location.href = "/";
			}
		} catch (_err) {
			error.value = "An unexpected error occurred";
		} finally {
			loading.value = false;
		}
	};

	return (
		<div class="min-h-screen bg-bg0 flex flex-col items-center justify-center p-5">
			<Logo />

			<Card>
				<div class="font-serif italic text-[22px] text-text0 mb-1">Sign in</div>
				<div class="mb-6" />

				<form onSubmit={handleSubmit} class="flex flex-col gap-3.5">
					<Input
						type="email"
						label="Email"
						value={login.value}
						onInput={(e) => {
							login.value = (e.target as HTMLInputElement).value;
						}}
						placeholder="admin@example.com"
						autoComplete="email"
						error={!!error.value}
					/>

					<Input
						type={showPass.value ? "text" : "password"}
						label="Password"
						value={password.value}
						onInput={(e) => {
							password.value = (e.target as HTMLInputElement).value;
						}}
						placeholder="••••••••"
						autoComplete="current-password"
						error={!!error.value}
						rightElement={
							<button
								type="button"
								onClick={() => {
									showPass.value = !showPass.value;
								}}
								class="bg-transparent border-none text-text2 cursor-pointer text-xs p-0.5"
							>
								{showPass.value ? "○" : "●"}
							</button>
						}
					/>

					{error.value && (
						<div class="px-[11px] py-2 bg-coral-faint border border-coral/30 rounded-[5px] text-[11px] text-coral">
							{error.value}
						</div>
					)}

					<Button type="submit" loading={loading.value} class="w-full mt-1">
						Sign in &rarr;
					</Button>
				</form>

				<div class="mt-5 p-3 bg-bg3 border border-ui-border rounded-md">
					<div class="text-[10px] text-text2 mb-1">Demo credentials</div>
					<div class="text-[10px] text-text1 font-mono leading-[1.7]">
						admin@example.com
						<br />
						admin
					</div>
				</div>
			</Card>

			<div class="mt-6 text-[10px] text-text2">qqCMS v0.1.0</div>
		</div>
	);
}
