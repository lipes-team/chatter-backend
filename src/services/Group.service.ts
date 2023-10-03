import { ObjectId, Types } from "mongoose";
import { addToDb, find, findOne } from "../database/abstraction";
import { Group, groupModel } from "../models/Group.model";

class GroupService {
    groupModel: typeof groupModel

    constructor() {
        this.groupModel = groupModel
    }

    async create(newGroup: Group) {
        return addToDb(this.groupModel, newGroup)
    }

    async getById(groupId: string) {
        return findOne(this.groupModel, { id: groupId })
    }

    async getAllByUserId(id: Types.ObjectId) {
        const groups = await find(this.groupModel, { "users.user": id })

        return groups ? groups : "No groups found for this user"
    }
}

export const groupService = new GroupService();