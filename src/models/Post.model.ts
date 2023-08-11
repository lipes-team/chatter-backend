import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';

const postSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	postInfo: {
		type: [Schema.Types.ObjectId],
		ref: 'PostBody',
		// TODO: Add reference after the postBody being created
		required: false,
	},
	comments: {
		type: Schema.Types.ObjectId,
		ref: 'Comments',
		required: false,
	},
});

type Post = InferSchemaType<typeof postSchema>;
type PostHydrated = HydratedDocument<typeof postSchema>;

const postModel = model<Post>('Post', postSchema);

export { postModel, Post, PostHydrated };
