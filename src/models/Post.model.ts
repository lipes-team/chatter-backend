import { Schema, model, InferSchemaType, Model } from 'mongoose';

import { NewResource } from '../database/abstraction';
import { Remover, Timestamps } from '../utils/types';

const postSchema = new Schema(
	{
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		postInfo: {
			type: [Schema.Types.ObjectId],
			ref: 'PostBody',
		},
		comments: {
			type: [Schema.Types.ObjectId],
			ref: 'Comments',
		},
	},
	{ timestamps: true }
);

type Post = InferSchemaType<typeof postSchema>;
type PostModel = Model<Post>;

type OptionalArrays = NewResource<Post, 'comments' | 'postInfo'>;
type NewPost = Remover<OptionalArrays, keyof Timestamps>;

const postModel = model('Post', postSchema);

export { postModel, Post, PostModel, NewPost };
