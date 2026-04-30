import { useSignal } from "@preact/signals";
import { api } from "@shared/api/client";

export function LoginForm() {
	const login = useSignal("");
	const password = useSignal("");
	const error = useSignal("");
	const loading = useSignal(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		loading.value = true;
		error.value = "";

		try {
			const { data, error: apiError } = await api.auth.login.post({
				login: login.value,
				password: password.value,
			});

			if (apiError) {
				// The API returns { error: string, code: string } for errors
				error.value = (apiError.value as { error?: string })?.error || "Login failed";
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
		<div class="card w-full max-w-sm bg-base-100 shadow-xl border border-base-300">
			<div class="card-body">
				<h2 class="card-title justify-center mb-4 text-2xl font-['Instrument_Serif'] italic">qqCMS Admin</h2>
				{error.value && (
					<div class="alert alert-error text-sm py-2 rounded-md">
						<span>{error.value}</span>
					</div>
				)}
				<form onSubmit={handleSubmit} class="flex flex-col gap-4">
					<div class="form-control">
						<label class="label pb-1" for="login-input">
							<span class="label-text">Email / Login</span>
						</label>
						<input
							id="login-input"
							type="text"
							class="input input-bordered"
							value={login.value}
							onInput={(e) => {
								login.value = (e.target as HTMLInputElement).value;
							}}
							required
							autofocus
						/>
					</div>
					<div class="form-control">
						<label class="label pb-1" for="password-input">
							<span class="label-text">Password</span>
						</label>
						<input
							id="password-input"
							type="password"
							class="input input-bordered"
							value={password.value}
							onInput={(e) => {
								password.value = (e.target as HTMLInputElement).value;
							}}
							required
						/>
					</div>
					<div class="form-control mt-4">
						<button type="submit" class="btn btn-primary w-full" disabled={loading.value}>
							{loading.value ? <span class="loading loading-spinner"></span> : "Sign In"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
