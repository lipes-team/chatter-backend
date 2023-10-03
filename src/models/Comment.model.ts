import { InferSchemaType, Model, Schema, Types, model } from 'mongoose';
import { Remover, Timestamps } from '../utils/types';

const commentSchema = new Schema(
	{
		text: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: false,
		},
		owner: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		post: {
			type: Schema.Types.ObjectId,
			ref: 'Post',
		},
	},
	{ timestamps: true }
);

interface NewComment {
	text: string;
	image?: string;
	owner: Types.ObjectId | string;
	post: Types.ObjectId | string;
}

type CommentInferred = InferSchemaType<typeof commentSchema>;
type CommentModel = Model<CommentInferred>;

const Comment = model<CommentInferred>('Comment', commentSchema);

export { Comment, CommentInferred, NewComment, CommentModel };
