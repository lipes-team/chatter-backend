import { Schema, Types, model } from 'mongoose';

const postBaseSchema = new Schema(
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
	{ timestamps: true, discriminatorKey: 'postType' }
);

interface PostBase {
	text: string;
	image?: string;
	owner: Types.ObjectId | string;
	post?: Types.ObjectId | string; // ?
}

const postBase = model<PostBase>('PostBase', postBaseSchema);

export { postBase, PostBase, postBaseSchema };
