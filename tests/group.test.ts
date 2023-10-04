import { app as application } from '../app';
import { Connection, Types, connect } from 'mongoose';
import { disconnectDB } from '../src/database/connection';
import { Group, GroupModel } from '../src/models/Group.model';
import { userService } from '../src/services/User.service';
import { logger } from '../src/utils/logger';
import { postRequest } from './utils/requestAbstraction';
import { expectStatus } from './utils/expectAbstractions';
import { groupService } from '../src/services/Group.service';
import { UserInferred } from '../src/models/User.model';
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('User Services', () => {
    let database: Connection;
    let app = application
    let mongod: MongoMemoryServer;

    let authToken = "";
    let header = { Authorization: "" };
    let testUser: UserInferred & {
        _id?: Types.ObjectId,
    }

    beforeAll(async () => {
        try {
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            database = (await connect(uri)).connection;
            await Group.ensureIndexes();

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
        await database.dropDatabase();
        await database.close();
        await mongod.stop();
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


            const res = await postRequest({ app, infoSend, route, header });
            expectStatus(res, 201);
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