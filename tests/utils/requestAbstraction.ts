import request from 'supertest';
import { app } from '../../app';

type RequestTypes = {
	infoSend: string | object;
	route: string;
	header?: {};
};

export const getRequest = async ({ infoSend, route, header }: RequestTypes) => {
	let res;
	if (header) {
		res = await request(app).get(route).set(header).send(infoSend);
	} else {
		res = await request(app).get(route).send(infoSend);
	}

	return res;
};

export const postRequest = async ({
	infoSend,
	route,
	header,
}: RequestTypes) => {
	let res;
	if (header) {
		res = await request(app).post(route).set(header).send(infoSend);
	} else {
		res = await request(app).post(route).send(infoSend);
	}

	return res;
};

export const putRequest = async ({ infoSend, route, header }: RequestTypes) => {
	let res;
	if (header) {
		res = await request(app).put(route).set(header).send(infoSend);
	} else {
		res = await request(app).put(route).send(infoSend);
	}

	return res;
};

export const deleteRequest = async ({
	infoSend,
	route,
	header,
}: RequestTypes) => {
	let res;
	if (header) {
		res = await request(app).delete(route).set(header).send(infoSend);
	} else {
		res = await request(app).delete(route).send(infoSend);
	}

	return res;
};
