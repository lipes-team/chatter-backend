import { Schema, model, InferSchemaType, Model, Types } from 'mongoose';
import { Remover } from '../utils/types';

const groupSchema = new Schema(
    {
        //group details. more things to add? 
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },

        //user references by role
        users: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true //true because there will always be atleast ONE (the creator)
                },
                role: {
                    type: String,
                    enum: ["Manager", "Moderator", "Veteran", "New user"],
                    required: true
                }
            }
        ],

        // TODO: WEBSOCKET. Just saving an ID for now, will implement later
        chatRoom: {
            type: String,
            required: true,
        },

        // Post reference Array

        posts: [{
            type: Schema.Types.ObjectId,
            ref: "Post",
        }]

    },
    { timestamps: true }
);

type GroupInferred = InferSchemaType<typeof groupSchema>

type NewGroup = Remover<GroupInferred, "users" | "createdAt" | "updatedAt"> & {
    users: Array<{
        user: String | Types.ObjectId;
        role: "Manager" | "Moderator" | "Veteran" | "New user"
    }>
}

type GroupModel = Model<GroupInferred>

const Group = model<GroupInferred>("Group", groupSchema)

export { GroupModel, GroupInferred, Group, NewGroup }