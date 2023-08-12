import { Response } from 'supertest';

type ResponseBody<Expected> = Expected extends Array<infer T> ? T : Expected;

export const expectStatus = (res: Response, status: number) => {
	expect(res.status).toEqual(status);
};

export const expectResponseBody = <Expected extends {}>(
	res: Response,
	expectedObject: Expected
) => {
	const responseBody = res.body as ResponseBody<Expected>;
	expect(responseBody).toMatchObject(expectedObject);
};
