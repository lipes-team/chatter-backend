import { addToDb } from "../database/abstraction";
import { Group, groupModel } from "../models/Group.model";

class GroupService {
    groupModel: typeof groupModel

    constructor() {
        this.groupModel = groupModel
    }

    async createGroup(newGroup: Group) {
        return addToDb(this.groupModel, newGroup)
    }
}

export const groupService = new GroupService();