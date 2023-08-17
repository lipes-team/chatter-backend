import { Post } from '../models/Post.model';
import { PostBody } from '../models/PostBody.model';
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
			const { postBody } = req.body;
			const newBody = await postBodyService.createPostBody(postBody);
			const postInfo = [newBody._id];
			const newPost = await postService.createPost({ postInfo });
			return res.status(201).json(newPost);
		} catch (error: any) {
			error.path = 'Create a new Post';
			next(error);
		}
	}
}

export const postController = new PostController();
