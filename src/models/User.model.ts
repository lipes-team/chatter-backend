import { Schema, model, InferSchemaType, Model } from 'mongoose';

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

type UserInferred = InferSchemaType<typeof userSchema>;
type UserModel = Model<UserInferred>;

const User = model<UserInferred>('User', userSchema);

export { User, UserInferred, UserModel };
