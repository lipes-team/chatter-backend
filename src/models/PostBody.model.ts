import { postBase, PostBase } from './PostBase.model';
import { Model, Schema } from 'mongoose';

const postBodySchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ['pending', 'live', 'past', 'inReview'],
			default: 'pending',
		},
	},
	{ timestamps: true }
);

interface PostBody extends PostBase {
	title: string;
	status?: 'pending' | 'live' | 'past' | 'inReview';
}

type PostBodyModel = Model<PostBody>;

const postBodyModel = postBase.discriminator<PostBody>(
	'PostBody',
	postBodySchema
);

export { postBodyModel, PostBody, PostBodyModel };
