import { Express } from 'express';
import { Connection } from 'mongoose';

import { initializeApp } from '../app';
import { disconnectDB } from '../src/database/connection';
import { groupModel } from '../src/models/Group.model';
import { userService } from '../src/services/User.service';
import { logger } from '../src/utils/logger';
import { postRequest } from './utils/requestAbstraction';
import { expectStatus } from './utils/expectAbstractions';


describe('User Services', () => {
    let database: Connection | undefined;
    let app: Express | undefined;
    let authToken = "";
    let header = { Authorization: "" };

    beforeAll(async () => {
        try {
            const { app: application, db } = await initializeApp();
            database = db;
            app = application;
            await groupModel.ensureIndexes();   //ensure mongoose validation based on userModel

            let userInfo = {
                name: 'Jane Doe',
                password: 'TestTest123',
                email: 'uniquejane@email.com',
            };

            await userService.createUser(userInfo);

            authToken = userService.createAuthToken({
                name: userInfo.name,
                email: userInfo.email
            })

            header = {
                Authorization: `Bearer ${authToken}`
            }

        } catch (error) {
            logger.error(error);
            // TODO: should throw an error here too?
        }
    });



    afterAll(async () => {
        try {
            await database?.db.dropDatabase();
            await disconnectDB();
        } catch (error) {
            logger.error(error);
        }
    });

    describe("CONTROLLERS", () => {
        it("Should create a new group", async () => {
            const infoSend = {
                name: "Test Group",
                description: "Group for testing purposes",
                users: [
                    {
                        userRef: "TEST",
                        role: "Manager"
                    }
                ],
                chatRoom: "test-chatroom",
                posts: []
            }

            const route = "/group/create";

            if (app) {
                const res = await postRequest({ app, infoSend, route, header });
                expectStatus(res, 201);
            }

        })

    })




});