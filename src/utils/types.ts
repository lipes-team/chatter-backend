import { NextFunction, Request, Response } from 'express';

export type RouteOpts = {
	error: ErrorOpts;
	req: Request;
	res: Response;
	next: NextFunction;
	payload?: Request & {}; // add the payload
};

type ErrorOpts = {
	path: string; // place? path? location?
	message: string;
	status: number;
};
