import { postService } from '../services/Post.service';
import { postBodyService } from '../services/PostBody.service';
import { RouteOpts } from '../utils/types';

class PostController {
	async create(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { activePost, title } = req.body;
			const owner = req.payload?.id!;

			const newPost = await postService.createPost({
				title,
				activePost,
				owner,
			});
			return res.status(201).json(newPost);
		} catch (error: any) {
			error.path = 'Create a new Post';
			next(error);
		}
	}

	async update(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		const postId = req.params.id;
		const { title, editPropose } = req.body;
		const owner = req.payload?.id!;
		try {
			const updatedPost = await postService.findPostAndUpdate(
				{ _id: postId, owner },
				{ title, editPropose, toUpdate: true },
				{
					new: true,
					lean: true,
				}
			);

			if (updatedPost === null) {
				throw {
					message: `The post was deleted and/or you aren't the owner`,
					status: 401,
				};
			}
			res.status(200).json(updatedPost);
		} catch (error: any) {
			error.path = 'Update a post';
			next(error);
		}
	}

	async delete(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const postId = req.params.id;
			const owner = req.payload?.id!;
			const deletedPost = await postService.deletePost({ _id: postId, owner });

			if (deletedPost.deletedCount === 0) {
				throw {
					message: `The post was deleted and/or you aren't the owner`,
					status: 401,
				};
			}
			res.sendStatus(204);
		} catch (error: any) {
			error.path = 'Delete a post';
			next(error);
		}
	}
}

export const postController = new PostController();
