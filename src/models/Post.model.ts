import { Schema, model, InferSchemaType, Model, Types } from 'mongoose';

import { OptionalArrays } from '../database/abstraction';
import { Remover, Timestamps } from '../utils/types';

const postSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		activePost: {
			text: {
				type: String,
				required: true,
			},
			image: String,
		},
		status: {
			type: String,
			enum: ['active', 'pending', 'inReview'],
			default: 'pending',
		},
		editPropose: {
			text: {
				type: String,
			},
			image: String,
		},
		toUpdate: {
			type: Boolean,
			default: false,
		},
		history: [
			{
				text: String,
				image: String,
			},
		],
		comments: {
			type: [Schema.Types.ObjectId],
			ref: 'Comments',
		},
	},
	{ timestamps: true }
);
// TODO: Change naming for model
type Post = InferSchemaType<typeof postSchema>;
type PostModel = Model<Post>;

type OptionalPost = OptionalArrays<
	Post,
	'comments' | 'history' | 'status' | 'toUpdate' | 'editPropose'
>;

type NewPost = Remover<OptionalPost, keyof Timestamps | 'owner'> & {
	owner: string | Types.ObjectId;
};

const postModel = model('Post', postSchema);

export { postModel, Post, PostModel, NewPost };
