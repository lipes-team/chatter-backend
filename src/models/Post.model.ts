import { Schema, model, InferSchemaType, Model } from 'mongoose';

import { OptionalArrays, RequiredArrays } from '../database/abstraction';
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

type OptionalPost = OptionalArrays<Post, 'comments'>;
type Required = RequiredArrays<OptionalPost, 'postInfo'>;
type NewPost = Remover<Required, keyof Timestamps>;

const postModel = model('Post', postSchema);

export { postModel, Post, PostModel, NewPost };
