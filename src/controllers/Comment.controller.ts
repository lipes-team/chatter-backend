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
			const postId = req.params.id!;
			const commentToCreate: NewComment = { text, owner, post: postId };
			const newComment = await commentService.createComment(commentToCreate);
			res.status(201).json(newComment);
		} catch (error: any) {
			error.path = 'Create comment';
			next(error);
		}
	}

	async findOne(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { id } = req.params;
			const comment = await commentService.findOneComment({ _id: id });
			res.status(200).json(comment);
		} catch (error: any) {
			error.place = 'Get one comment';
			next(error);
		}
	}

	async update(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { id } = req.params;
			const owner = req.payload?.id!;
			const { text, image } = req.body;
			const commentFound = await commentService.findOneComment({ _id: id });
			if (!commentFound) {
				throw {
					status: 400,
					message: `Seems that this isn't a comment`,
				};
			}

			if (commentFound.owner.toString() !== owner) {
				throw {
					status: 401,
					message: `You aren't allowed to edit this comment`,
				};
			}

			const commentUpdated = await commentService.updateOneComment(
				{ _id: id, owner },
				{ text, image },
				{ new: true }
			);
			res.status(200).json(commentUpdated);
		} catch (error: any) {
			error.path = 'Update comment';
			next(error);
		}
	}

	async delete(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { id } = req.params;
			const owner = req.payload?.id!;
			const commentFound = await commentService.findOneComment({ _id: id });
			if (!commentFound) {
				throw {
					status: 400,
					message: 'Comment not found',
				};
			}

			if (commentFound.owner.toString() !== owner) {
				throw {
					status: 401,
					message: `You aren't allowed to delete this comment`,
				};
			}

			await commentService.deleteOneComment({ _id: id, owner });
			res.status(204).json();
		} catch (error: any) {
			error.path = 'Delete comment';
			next(error);
		}
	}
}

export const commentController = new CommentController();
