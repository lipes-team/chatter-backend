import {
	FilterOptions,
	OptionsQuery,
	UpdateOptions,
	addToDb,
	deleteOne,
	findOne,
	update,
} from '../database/abstraction';
import {
	Comment,
	CommentModel,
	NewComment,
	commentModel,
} from '../models/Comment.model';

type Filter = FilterOptions<Comment>;
type Update = UpdateOptions<Comment>;
type Options = OptionsQuery<Comment>;

class CommentService {
	commentModel: CommentModel;
	constructor() {
		this.commentModel = commentModel;
	}

	async createComment(newComment: NewComment) {
		return addToDb(this.commentModel, newComment);
	}

	async findOneComment(filter: Filter, options?: Options) {
		return findOne(this.commentModel, filter, options);
	}

	async updateOneComment(
		filter: Filter,
		updateData: Update,
		options?: Options
	) {
		return update(this.commentModel, filter, updateData, options);
	}

	async deleteOneComment(filter: Filter, options?: Options) {
		return deleteOne(this.commentModel, filter, options);
	}
}

export const commentService = new CommentService();
