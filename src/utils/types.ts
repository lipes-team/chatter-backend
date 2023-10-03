import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export type RouteOpts = {
	error: ErrorOpts;
	req: Request;
	res: Response;
	next: NextFunction;
	payload: Request & { payload?: Payload };
};

interface Payload extends JwtPayload {
	name: string;
	email: string;
	id: string;
}

type ErrorOpts = {
	path: string; // place? path? location?
	message: string;
	status: number;
	issues?: {
		message: any;
		expected: string;
		received: string;
		path: string[];
	}[];
};

export type Timestamps = {
	createdAt: NativeDate;
	updatedAt: NativeDate;
};

export type Remover<T, K extends keyof T> = Omit<T, K>;
