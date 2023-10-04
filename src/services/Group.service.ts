import { Types } from "mongoose";
import { addToDb, find, findOne } from "../database/abstraction";
import { Group, GroupModel, NewGroup } from "../models/Group.model";

class GroupService {
    GroupModel: GroupModel

    constructor() {
        this.GroupModel = Group;
    }

    async create(newGroup: NewGroup) {
        return addToDb(this.GroupModel, newGroup)
    }

    async getById(groupId: string) {
        return findOne(this.GroupModel, { id: groupId })
    }

    async getAllByUserId(id: Types.ObjectId) {
        const groups = await find(this.GroupModel, { "users.user": id })

        return groups ? groups : "No groups found for this user"
    }
}

export const groupService = new GroupService();