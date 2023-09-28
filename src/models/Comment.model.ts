import { InferSchemaType, Model, Schema, Types, model } from 'mongoose';

const commentSchema = new Schema(
	{
		text: {
			type: String,
			required: true,
		},
		image: String,
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
type Comment = InferSchemaType<typeof commentSchema>;
type CommentModel = Model<Comment>;
const commentModel = model<Comment>('Comment', commentSchema);

export { commentModel, Comment, NewComment, CommentModel };
