export class NotFoundError extends Error {
	readonly status = 404;
	readonly code: string;

	constructor(message: string, code = "NOT_FOUND") {
		super(message);
		this.code = code;
	}
}

export class ConflictError extends Error {
	readonly status = 409;
	readonly code: string;

	constructor(message: string, code = "CONFLICT") {
		super(message);
		this.code = code;
	}
}

export class UnauthorizedError extends Error {
	readonly status = 401;
	readonly code: string;

	constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
		super(message);
		this.code = code;
	}
}
