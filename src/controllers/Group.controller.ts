import { RouteOpts } from "../utils/types";
import { groupService } from './../services/Group.service';
import { Group } from "../models/Group.model";
import { Types } from "mongoose";


class GroupController {
    async create(
        req: RouteOpts["payload"],
        res: RouteOpts["res"],
        next: RouteOpts["next"]
    ) {
        try {
            const { name, description } = req.body;

            const { id } = req.payload!

            const newGroup: Group = {
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
        }
    }
}

export const groupController = new GroupController;