import {
	Document,
	Schema,
	model,
	InferSchemaType,
	HydratedDocumentFromSchema,
	Types,
	HydratedDocument,
} from 'mongoose';

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		password: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		groupMembership: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
		groupSubscription: {
			type: [
				{
					group: { type: Schema.Types.ObjectId, ref: 'Group' },
					lastSeen: { type: Schema.Types.ObjectId, ref: 'Post' },
				},
			],
		},
	},
	{ timestamps: true }
);

type User = InferSchemaType<typeof userSchema>;
type UserHydrated = HydratedDocument<typeof userSchema>;
const userModel = model<User>('User', userSchema);

export { userModel, UserHydrated, User };
