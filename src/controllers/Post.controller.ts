import { Post } from '../models/Post.model';
import { postService } from '../services/Post.service';
import { RouteOpts } from '../utils/types';

class PostController {
	async create(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { title }: Post = req.body;
			if (!title) {
				const error = {
					message: 'Title required',
					status: 400,
				};
				throw error;
			}
			const newPost = await postService.createPost({ title: title! });
			return res.status(201).json(newPost);
		} catch (error: any) {
			error.path = 'Create a new Post';
			next(error);
		}
	}
}

export const postController = new PostController();
