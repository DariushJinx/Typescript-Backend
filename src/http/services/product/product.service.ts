import { StatusCodes } from "http-status-codes";
import { ProductModel } from "../../models/product/product.model";
import { IProduct } from "../../types/product/product.types";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { FunctionUtils } from "../../../utils/functions";

export class ProductService {
  async findProductWitId(id: string): Promise<IProduct | null> {
    const product: IProduct | null = await ProductModel.findById(id);
    return product;
  }

  async findProductWithIDOrTitle(field: string): Promise<IProduct | null> {
    const findQuery = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
    const product: IProduct | null = await ProductModel.findOne(findQuery).lean();
    return product;
  }

  async findFeatureInFeatures(productID: string, title: string): Promise<IProduct> {
    const findResult: IProduct | null = await ProductModel.findOne(
      { _id: productID, "features.feature_detail.feature_title": title },
      { "features.feature_detail.$": 1 }
    );
    if (findResult) {
      const userDetail = FunctionUtils.copyObject(findResult);
      return userDetail?.features?.feature_detail?.[0];
    } else {
      throw createHttpError.NotFound("محصول مورد نظر یافت نشد");
    }
  }
}
