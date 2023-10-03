import { NewPost, PostInferred, PostModel, Post } from '../models/Post.model';
import {
	addToDb,
	findOne,
	deleteOne,
	update,
	FilterOptions,
	UpdateOptions,
	OptionsQuery,
} from '../database/abstraction';

type Filter = FilterOptions<PostInferred>;
type Update = UpdateOptions<PostInferred>;
type Options = OptionsQuery<PostInferred>;

class PostService {
	postModel: PostModel;
	constructor() {
		this.postModel = Post;
	}

	async createPost(newPost: NewPost) {
		return addToDb(this.postModel, newPost);
	}

	async findOnePost(filter: Filter, options?: Options) {
		return findOne(this.postModel, filter, options);
	}

	async findPostAndUpdate(
		filter: Filter,
		updateData: Update,
		options?: Options
	) {
		return update(this.postModel, filter, updateData, options);
	}

	async deletePost(filter: Filter) {
		return deleteOne(this.postModel, filter);
	}
}

export const postService = new PostService();
