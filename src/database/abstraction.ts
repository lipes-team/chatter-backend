import { Timestamps } from '../utils/types';
import {
	Model,
	InferSchemaType,
	HydratedDocument,
	HydratedDocumentFromSchema,
	FilterQuery,
	QueryOptions,
	UpdateQuery,
} from './mongoose.imports';

type NoTimestamps<TModel> = Omit<TModel, keyof Timestamps>;
type FilterOptions<TModel> = FilterQuery<TModel> & { _id?: string };

export const addToDb = <TModel>(
	model: Model<TModel>,
	newObject: NoTimestamps<TModel>
) => {
	return model.create(newObject);
};

export const find = <TModel>(
	model: Model<TModel>,
	filter?: FilterOptions<TModel>,
	options?: QueryOptions<TModel>
) => {
	const hasFilter = filter === undefined ? {} : filter;
	return model.find(hasFilter, {}, options);
};

export const findOne = <TModel>(
	model: Model<TModel>,
	filter: FilterOptions<TModel>,
	options?: QueryOptions<TModel>
) => {
	return model.findOne(filter, {}, options);
};

type UpdateOptions<TModel> = UpdateQuery<TModel> | Partial<TModel>

export const update = <TModel>(
	model: Model<TModel>,
	filter: FilterOptions<TModel>,
	updateData: UpdateOptions<TModel>,
	options?: QueryOptions<TModel>
) => {
	return model.findOneAndUpdate(filter, updateData, options);
};

type MongooseAbs<TModel> = (	
  model: Model<TModel>
  filter: FilterOptions<TModel>)
