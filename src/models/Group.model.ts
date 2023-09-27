import { Schema, model, InferSchemaType, Model } from 'mongoose';

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
                userRef: {
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
            required: true
        }]

    },
    { timestamps: true }
);

type Group = InferSchemaType<typeof groupSchema>

const groupModel = model<Group>("Group", groupSchema)

export { groupModel, Group }