import { Post, postModel } from '../models/Post.model';
import {
	addToDb,
	find,
	findOne,
	deleteOne,
	update,
	FilterOptions,
	UpdateOptions,
	OptionsQuery,
} from '../database/abstraction';

type Filter = FilterOptions<Post>;
type Update = UpdateOptions<Post>;
type Options = OptionsQuery<Post>;

class PostService {
	async createPost(newPost: Partial<Post>) {
		return addToDb(postModel, newPost);
	}

	// TODO: Should find all the posts the user subscribes?
	async findAllPosts(filter: Filter, options?: Options) {
		return find(postModel, filter, options);
	}

	async findOnePost(filter: Filter, options?: Options) {
		return findOne(postModel, filter, options);
	}

	async findPostAndUpdate(
		filter: Filter,
		updateData: Update,
		options?: Options
	) {
		return update(postModel, filter, updateData, options);
	}

	async deletePost(filter: Filter) {
		return deleteOne(postModel, filter);
	}
}

export const postService = new PostService();
