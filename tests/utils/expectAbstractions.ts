import { Response } from 'supertest';

export const expected = <Expected extends {} | any[]>(
	res: Response,
	resStatus: number,
	expectedObject: {}
) => {
	expect(res.status).toEqual(resStatus);
	expect(res.body).toMatchObject<Expected>(
		expect.objectContaining(expectedObject)
	);
};
