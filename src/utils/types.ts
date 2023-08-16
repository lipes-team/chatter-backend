import { NextFunction, Request, Response } from 'express';

export type RouteOpts = {
	error: ErrorOpts;
	req: Request;
	res: Response;
	next: NextFunction;
	payload: Request; // add the payload
};

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
