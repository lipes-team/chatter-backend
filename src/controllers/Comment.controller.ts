import { NewComment } from '../models/Comment.model';
import { commentService } from '../services/Comment.service';
import { RouteOpts } from '../utils/types';

class CommentController {
	async create(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { text } = req.body;
			const owner = req.payload?.id!;
			const postId = req.params.id;
			const commentToCreate: NewComment = { text, owner, post: postId };
			const newComment = await commentService.createComment(commentToCreate);
			res.status(201).json(newComment);
		} catch (error: any) {
			error.path = 'Create comment';
			next(error);
		}
	}
	async findOne() {}
	async update() {}
	async delete() {}
}

export const commentController = new CommentController();
