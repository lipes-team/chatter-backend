import { Response } from 'supertest';

export const expectStatus = (res: Response, status: number) => {
	expect(res.status).toEqual(status);
};

export const expectResponseBody = <Expected extends {}>(
	res: Response,
	expectedObject: Expected
) => {
	const responseBody = res.body;
	expect(responseBody).toEqual(expect.objectContaining(expectedObject));
};
