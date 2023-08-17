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
	owner: Types.ObjectId;
	post?: Types.ObjectId; // ?
}

const postBase = model<PostBase>('PostBase', postBaseSchema);

export { postBase, PostBase, postBaseSchema };
