import { create } from '../database/abstraction';
import {
	Schema,
	model,
	InferSchemaType,
	HydratedDocument,
} from '../database/mongoose.imports';
import { Timestamps } from '../utils/types';

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		groupMembership: {
			type: [Schema.Types.ObjectId],
			ref: 'Group',
			required: false,
		},

		groupSubscription: {
			type: [
				{
					group: {
						type: Schema.Types.ObjectId,
						ref: 'Group',
					},
					lastSeen: {
						type: Schema.Types.ObjectId,
						ref: 'Post',
					},
				},
			],
			required: false,
		},
	},
	{ timestamps: true }
);

type User = InferSchemaType<typeof userSchema>;
type UserHydrated = HydratedDocument<typeof userSchema>;
const userModel = model<User>('User', userSchema);

export { userModel, UserHydrated, User };
