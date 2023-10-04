import { RouteOpts } from "../utils/types";
import { groupService } from './../services/Group.service';
import { Group, GroupModel, NewGroup } from "../models/Group.model";
import { Types } from "mongoose";
import { findOne } from "../database/abstraction";


class GroupController {
    async create(
        req: RouteOpts["payload"],
        res: RouteOpts["res"],
        next: RouteOpts["next"]
    ) {
        try {
            const { name, description } = req.body;

            const { id } = req.payload!

            const newGroup: NewGroup = {
                name,
                description,
                users: [
                    {
                        user: new Types.ObjectId(id),
                        role: "Manager",
                    }
                ],
                chatRoom: "test-chatroom",
                posts: []
            };

            const createdGroup = await groupService.create(newGroup);

            return res.status(201).json(createdGroup);

        } catch (error: any) {
            error.path = "Create new group";
            error.status = 400;
            next(error);
        }
    }

    async getById(
        req: RouteOpts["payload"],
        res: RouteOpts["res"],
        next: RouteOpts["next"]
    ) {
        try {
            let groupId = req.params.groupId
            const groupInfo = await groupService.getById(groupId)

            return res.status(201).json(groupInfo);

        } catch (error: any) {
            error.path = "Get group by Id";
            error.status = 400;
        }
    }

    async getAllUserGroups(
        req: RouteOpts["payload"],
        res: RouteOpts["res"],
        next: RouteOpts["next"]
    ) {
        try {
            const { id } = req.payload!


        } catch (error: any) {
            error.path = "Get all groups of logged in user";
            error.status = 400;
        }
    }
}

export const groupController = new GroupController;