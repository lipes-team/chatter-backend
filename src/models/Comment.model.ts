import { Schema, Types, model } from 'mongoose';

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

interface Comment {
	text: string;
	image?: string;
	owner: Types.ObjectId | string;
	post: Types.ObjectId | string;
}

const comment = model<Comment>('PostBase', commentSchema);

export { comment, Comment, commentSchema };
