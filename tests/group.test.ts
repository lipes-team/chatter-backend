import { Express } from 'express';
import { Connection, Types, Schema } from 'mongoose';

import { initializeApp } from '../app';
import { disconnectDB } from '../src/database/connection';
import { Group, GroupInferred, groupModel } from '../src/models/Group.model';
import { userService } from '../src/services/User.service';
import { logger } from '../src/utils/logger';
import { postRequest } from './utils/requestAbstraction';
import { expectStatus } from './utils/expectAbstractions';
import { groupService } from '../src/services/Group.service';
import { User } from '../src/models/User.model';


describe('User Services', () => {
    let database: Connection | undefined;
    let app: Express | undefined;
    let authToken = "";
    let header = { Authorization: "" };
    let testUser: User & {
        _id?: Types.ObjectId,
    }

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

            testUser = await userService.createUser(userInfo);

            authToken = userService.createAuthToken({
                name: userInfo.name,
                email: userInfo.email
            })

            header = {
                Authorization: `Bearer ${authToken}`
            }


            let testGroup = await groupService.create({
                name: "Test Group",
                description: "Group for testing purposes",
                users: [
                    {
                        user: testUser._id!,
                        role: "Manager",
                    }
                ],
                chatRoom: "test-chatroom",
                posts: []
            })

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
                name: "Test Group 2",
                description: "Group for testing purposes 2",
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

    describe("SERVICES", () => {
        it("Testing environment should create a group with a user", async () => {
            const groupsOfUser = await groupService.getAllByUserId(testUser._id!)

            expect(groupsOfUser).toEqual(
                expect.arrayContaining(
                    [
                        expect.objectContaining(
                            {
                                name: "Test Group",
                                description: "Group for testing purposes",
                                users:
                                    expect.arrayContaining(
                                        [
                                            expect.objectContaining(
                                                {
                                                    user: testUser._id!,
                                                    role: "Manager",
                                                }
                                            )
                                        ],
                                    )
                            }
                        )
                    ]
                )
            )
        })
    })


});