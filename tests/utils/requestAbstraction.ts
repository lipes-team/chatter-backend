import request, { Response } from 'supertest';
import { Express } from 'express';

export type RequestTypes = {
	app: Express;
	infoSend: string | object;
	route: string;
	header?: {};
};

const makeRequest = (
	app: Express,
	method: 'get' | 'put' | 'delete' | 'post',
	{ infoSend, route, header }: RequestTypes
): Promise<Response> => {
	let req = request(app)[method](route);

	if (header) {
		req.set(header);
	}

	return req.send(infoSend);
};

export const getRequest = async (options: RequestTypes): Promise<Response> => {
	return makeRequest(options.app, 'get', options);
};

export const postRequest = async (options: RequestTypes): Promise<Response> => {
	return makeRequest(options.app, 'post', options);
};

export const putRequest = async (options: RequestTypes): Promise<Response> => {
	return makeRequest(options.app, 'put', options);
};

export const deleteRequest = async (
	options: RequestTypes
): Promise<Response> => {
	return makeRequest(options.app, 'delete', options);
};
