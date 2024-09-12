import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<T> {
  constructor(public readonly model: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as unknown as T;
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T> {
    const document = await this.model.findOne(filterQuery).lean<T>();

    if (!document) {
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async findById(id: string): Promise<T> {
    const document = await this.model.findById(id).lean<T>();
    if (!document) {
      throw new NotFoundException('Document not found.');
    }
    return document;
  }

  // async findOneAndUpdate(
  //   filterQuery: FilterQuery<T>,
  //   update: UpdateQuery<T>,
  // ): Promise<T> {
  //   const document = await this.model.findOneAndUpdate(filterQuery, update, {
  //     new: true,
  //   }).lean<T>();
  //   if (!document) {
  //     throw new NotFoundException('Document not found.');
  //   }

  //   return document;
  // }

  // async findOneAndDelete(filterQuery: FilterQuery<T>): Promise<T> {
  //   return this.model.findOneAndDelete(filterQuery).lean<T>();
  // }
  async find(
    filterQuery: FilterQuery<T> = {},
    projection?: string | Record<string, any>,
    options?: QueryOptions): Promise<T[]> {
    const documents = await this.model.find(filterQuery).select(projection).lean<T[]>().sort(options?.sort);
    if (!documents) {
      throw new NotFoundException('Documents not found.'); // 404
    }
    return documents;
  }


  async findByIdAndUpdate(id: string, update: UpdateQuery<T>): Promise<T> {
    const document = await this.model.findByIdAndUpdate(id, update, {new: true}).lean<T>();
    if (!document) {
      throw new NotFoundException('Document not found.');
    }
    return document;
  }

  async findByIdAndDelete(id: string): Promise<T> {
    const document = await this.model.findByIdAndDelete(id).lean<T>();
    if (!document) {
      throw new NotFoundException('Document not found.');
    }
    return document;
  }
}