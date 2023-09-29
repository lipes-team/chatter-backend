import { FilterQuery, Types, UpdateQuery, QueryOptions, Model } from 'mongoose';

export type OptionalArrays<TModel, KeysToChange extends keyof TModel> = Omit<
	TModel,
	KeysToChange
> & {
	[key in KeysToChange]?: TModel[key] extends Array<infer TArray>
		? TArray[] extends Types.ObjectId[]
			? string[] | string | Types.ObjectId[] | Types.ObjectId
			: TArray[]
		: TModel[key];
};

export type RequiredArrays<TModel, KeysToChange extends keyof TModel> = Omit<
	TModel,
	KeysToChange
> & {
	[key in KeysToChange]: TModel[key] extends Array<infer TArray>
		? TArray[] extends Types.ObjectId[]
			? string[] | string | Types.ObjectId[] | Types.ObjectId
			: TArray[]
		: TModel[key];
};

export type FilterOptions<TModel> = FilterQuery<TModel> & {
	_id?: string | Types.ObjectId | Types.ObjectId[];
};
export type UpdateOptions<TModel> = UpdateQuery<TModel> | Partial<TModel>;
export type OptionsQuery<TModel> = QueryOptions<TModel>;

export const addToDb = <TModel, TCreate>(
	model: Model<TModel>,
	newObject: TCreate | TCreate[] // changed to array of objects
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

export const update = <TModel>(
	model: Model<TModel>,
	filter: FilterOptions<TModel>,
	updateData: UpdateOptions<TModel>,
	options?: QueryOptions<TModel>
) => {
	return model.findOneAndUpdate(filter, updateData, options);
};

export const deleteOne = <TModel>(
	model: Model<TModel>,
	filter: FilterOptions<TModel>,
	options?: OptionsQuery<TModel>
) => {
	return model.findOneAndDelete(filter, options);
};

export const deleteMany = <TModel>(
	model: Model<TModel>,
	filter: FilterOptions<TModel>
) => {
	return model.deleteMany(filter);
};
