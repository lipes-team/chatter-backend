import { Schema, model, InferSchemaType, Model, Types } from 'mongoose';
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
			required: false,
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
			required: false,
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

type PostInferred = InferSchemaType<typeof postSchema>;
type PostModel = Model<PostInferred>;

type NewPost = Remover<
	PostInferred,
	keyof Timestamps | 'owner' | 'toUpdate' | 'status'
> & {
	owner: string | Types.ObjectId;
};

const Post = model('Post', postSchema);

export { Post, PostInferred, PostModel, NewPost };
