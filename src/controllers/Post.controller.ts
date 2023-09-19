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
			const { postBody, title } = req.body;
			const owner = req.payload?.id!;
			const newBody = await postBodyService.createPostBody({
				...postBody,
				owner,
			});
			const newPost = await postService.createPost({
				title,
				postInfo: newBody._id,
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
		const { title, postBody } = req.body;
		const owner = req.payload?.id!;
		try {
			const newBody =
				postBody &&
				(await postBodyService.createPostBody({
					text: postBody.text,
					image: postBody.image,
					owner,
				}));

			const updatedPost = await postService.findPostAndUpdate(
				{ _id: postId, owner },
				{ title, $addToSet: { postInfo: newBody } },
				{
					new: true,
					lean: true,
					populate: {
						path: 'postInfo',
						options: { sort: { createdAt: -1 } },
					},
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
}

export const postController = new PostController();
