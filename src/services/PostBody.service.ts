import {
	addToDb,
	deleteOne,
	FilterOptions,
	OptionsQuery,
	update,
	UpdateOptions,
} from '../database/abstraction';

import {
	PostBody,
	postBodyModel,
	PostBodyModel,
} from '../models/PostBody.model';

type Filter = FilterOptions<PostBody>;
type Update = UpdateOptions<PostBody>;
type Options = OptionsQuery<PostBody>;

/**
 * Post Body services to create and deleteMany postBody.
 * @remarks Edit and Find are managed by the Post (Parent)
 */
class PostBodyService {
	postModel: PostBodyModel;
	constructor() {
		this.postModel = postBodyModel;
	}

	/**
	 *
	 * @param newPost Object: `{
	 * status:'pending' | 'live' | 'past' | 'inReview',
	 * text:string,
	 * image:string,
	 * owner:Types.ObjectId}`
	 * @returns `Promise`
	 */
	async createPostBody(newPost: PostBody) {
		return addToDb(this.postModel, newPost);
	}

	async findOnePostAndUpdate(
		filter: Filter,
		updateData: Update,
		options?: Options
	) {
		return update(this.postModel, filter, updateData, options);
	}

	/**
	 *
	 * @param filter should receive _id saved in the Post (parent)
	 * @returns `Promise`
	 */
	async deleteOneBody(filter: Filter) {
		return deleteOne(this.postModel, filter);
	}
}

export const postBodyService = new PostBodyService();
