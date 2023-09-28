import {
	FilterOptions,
	OptionsQuery,
	UpdateOptions,
	addToDb,
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
}

export const commentService = new CommentService();
