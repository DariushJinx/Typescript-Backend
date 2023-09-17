import { Controller, Delete, Get, Middleware, Patch, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { FunctionUtils } from "../../../utils/functions";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { ProductService } from "../../services/product/product.service";
import { ProductModel } from "../../models/product/product.model";
import { CreateProductDto } from "../../dtos/product/product.dto";
import { CommentModel } from "../../models/comment/comment.model";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { Upload } from "../../../utils/multer";
import { stringToArray } from "../../middlewares/stringToArray";

@Controller("product")
export class ProductController {
  private productService: ProductService = new ProductService();

  @Post("add")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags", "colors"))
  async addProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const createProductDto: CreateProductDto = plainToClass(CreateProductDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createProductDto);
      const files = req.files as { [filename: string]: Express.Multer.File[] };
      if (Array.isArray(files)) {
        const images = FunctionUtils.ListOfImagesForRequest(files || [], req.body.fileUploadPath);
        const supplier = req?.user?._id;
        const {
          title,
          short_title,
          text,
          short_text,
          category,
          tags,
          colors,
          count,
          price,
          discount,
        } = createProductDto;
        const product = await ProductModel.create({
          title,
          short_title,
          text,
          short_text,
          category,
          tags,
          colors,
          count,
          price,
          discount,
          images,
          supplier,
        });
        if (!product) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: "محصول مورد نظر با موفقیت ایجاد نشد",
            },
          });
        }

        return res.status(StatusCodes.CREATED).json({
          statusCode: StatusCodes.CREATED,
          data: {
            message: "محصول مورد نظر با موفقیت ایجاد شد",
            product,
          },
        });
      }
    } catch (err) {
      FunctionUtils.deleteFileInPublic(req.body.images);
      next(err);
    }
  }

  @Get("list")
  async listOfProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductModel.find({})
        .populate([
          {
            path: "category",
            select: { title: 1, _id: 0 },
          },
          {
            path: "likes",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "dislikes",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "bookmarks",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "supplier",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
        ])
        .lean();

      const comments = await CommentModel.find({ show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let allProducts: object[] = [];
      products.forEach((product) => {
        let productTotalScore = 5;

        let productScores = comments.filter((comment) => {
          if (comment.productName) {
            if (comment.productName.toString() === product._id.toString()) {
              return comment;
            }
          }
        });

        let productComments = comments.filter((comment) => {
          if (comment.productName) {
            if (comment.productName.toString() === product._id.toString()) {
              return comment;
            }
          }
        });

        productScores.forEach((comment) => {
          productTotalScore += Number(comment.score);
        });

        allProducts.push({
          ...product,
          productComments,
          productAverageScore: Math.floor(productTotalScore / (productScores.length + 1)),
        });
      });

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی محصولات موجود با موفقیت بازگردانی شدند",
          allProducts,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("search")
  async searchOfProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req?.query;

      if (typeof search == "string" && search) {
        const product = await ProductModel.findOne({ $text: { $search: search } })
          .populate([
            {
              path: "supplier",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "category",
              select: { title: 1, _id: 0 },
            },
            {
              path: "likes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "dislikes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "bookmarks",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
          ])
          .lean();
        const comments = await CommentModel.find({ productName: product?._id, show: 1 })
          .populate([
            { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .lean();

        let productTotalScore = 5;

        let productScores = comments.filter((comment) => {
          if (comment.productName) {
            if (comment.productName.toString() === product?._id.toString()) {
              return comment;
            }
          }
        });

        let productComments = comments.filter((comment) => {
          if (comment.productName) {
            if (comment.productName.toString() === product?._id.toString()) {
              return comment;
            }
          }
        });

        productScores.forEach((comment) => {
          productTotalScore += Number(comment.score);
        });

        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "بنا به جستجوی مورد نظر اطلاعات بازگردانده شدند",
            ...product,
            productComments,
            courseAverageScore: Math.floor(productTotalScore / (productScores.length + 1)),
          },
        });
      } else {
        const products = await ProductModel.find({})
          .populate([
            {
              path: "supplier",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "category",
              select: { title: 1, _id: 0 },
            },
            {
              path: "likes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "dislikes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "bookmarks",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
          ])
          .lean();
        const comments = await CommentModel.find({ show: 1 })
          .populate([
            { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .lean();
        let allProducts: object[] = [];
        products.forEach((product) => {
          let productTotalScore = 5;

          let productScores = comments.filter((comment) => {
            if (comment.productName) {
              if (comment.productName.toString() === product._id.toString()) {
                return comment;
              }
            }
          });

          let productComments = comments.filter((comment) => {
            if (comment.productName) {
              if (comment.productName.toString() === product._id.toString()) {
                return comment;
              }
            }
          });

          productScores.forEach((comment) => {
            productTotalScore += Number(comment.score);
          });

          allProducts.push({
            ...product,
            productComments,
            courseAverageScore: Math.floor(productTotalScore / (productScores.length + 1)),
          });
        });

        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "بنا به جستجوی مورد نظر اطلاعات بازگردانده شدند",
            allProducts,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Patch("add-features/:field")
  @Middleware(AuthMiddleware)
  async addFeaturesForProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { field } = req.params;
      const { feature_title, feature_description } = req.body;
      const product = await this.productService.findProductWithIDOrTitle(field);
      const updateResult = await ProductModel.updateOne(
        { _id: product?._id },
        {
          $push: {
            "features.feature_detail": { feature_title, feature_description },
          },
        }
      );
      if (!updateResult.modifiedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "جزئیاتی برای محصول اضافه نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "جزئیات برای محصول با موفقیت اضافه شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("remove-feature/:productID")
  @Middleware(AuthMiddleware)
  async removeFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { productID } = req.params;
      const { title } = req.body;
      const product = await ProductModel.findById(productID);
      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "محصول مورد نظر یافت نشد",
          },
        });
      }
      const feature = await this.productService.findFeatureInFeatures(productID, title);

      if (feature?.feature_title !== title) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "حذف ویژگی محصول مورد نظر انجام نشد",
          },
        });
      } else {
        await ProductModel.updateOne(
          { _id: productID },
          {
            $pull: {
              "features.feature_detail": {
                feature_title: title,
              },
            },
          }
        );
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "حذف ویژگی محصول مورد نظر با موفقیت انجام شد",
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove-product/:field")
  @Middleware(AuthMiddleware)
  async removeProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { field } = req.params;
      const product = await this.productService.findProductWithIDOrTitle(field);
      const removeResult = await ProductModel.deleteOne({ _id: product?._id });
      if (!removeResult.deletedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "حذف محصول مورد نظر با موفقیت انجام نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "حذف محصول مورد نظر با موفقیت انجام شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get(":field")
  async getOneProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { field } = req.params;
      const product = await this.productService.findProductWithIDOrTitle(field);
      const comments = await CommentModel.find({ productName: product?._id, show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let productTotalScore = 5;

      let productScores = comments.filter((comment) => {
        if (comment.productName) {
          if (comment.productName.toString() === product?._id.toString()) {
            return comment;
          }
        }
      });

      productScores.forEach((comment) => {
        productTotalScore += Number(comment.score);
      });

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "محصول مورد نظر یافت نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "محصول مورد نظر با موفقیت بازگردانی شد",
          ...product,
          comments,
          courseAverageScore: Math.floor(productTotalScore / (productScores.length + 1)),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("update-product/:field")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags", "colors"))
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { field } = req.params;
      if(field){        
        const product = await this.productService.findProductWithIDOrTitle(field);
        const files = req.files as { [filename: string]: Express.Multer.File[] };
        const ProductBlackList = ["bookmarks", "likes", "dislikes", "comments", "supplier", "colors"];
        const data = FunctionUtils.copyObject(req.body);
        FunctionUtils.deleteInvalidPropertyInObject(data, ProductBlackList);
        if (Array.isArray(files)) {
          if (req?.body?.fileUploadPath && files) {
            FunctionUtils.ListOfImagesForRequest(files || [], req.body.fileUploadPath);
          }
          const updateResult = await ProductModel.updateOne({ _id: product?._id }, { $set: data });
          if (!updateResult.modifiedCount) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
              data: {
                message: "محصول مورد نظر با موفقیت به روزرسانی نشد",
              },
            });
          }
          return res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: {
              message: "محصول مورد نظر با موفقیت به روزرسانی شد",
            },
          });
        }
      }
    } catch (err) {
      FunctionUtils.deleteFileInPublic(req.body.images);
      next(err);
    }
  }

  @Get("like/:productID")
  @Middleware(AuthMiddleware)
  async likedProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productID } = req.params;
      await this.productService.findProductWitId(productID);
      const user = req.user;
      const likesProduct = await ProductModel.findOne({
        _id: productID,
        likes: user?._id,
      });
      const dislikesProduct = await ProductModel.findOne({
        _id: productID,
        dislikes: user?._id,
      });

      const findQueryForLikesProduct = likesProduct
        ? { $pull: { likes: user?._id } }
        : { $push: { likes: user?._id } };
      const findQueryForDislikesProduct = dislikesProduct && {
        $pull: { dislikes: user?._id },
      };
      await ProductModel.updateOne({ _id: productID }, findQueryForLikesProduct);
      let message;
      if (!likesProduct) {
        if (findQueryForDislikesProduct) {
          if (dislikesProduct) {
            await ProductModel.updateOne({ _id: productID }, findQueryForDislikesProduct);
          }
        }
        message = "پسندیدن محصول با موفقیت انجام شد";
      } else message = "پسندیدن محصول با موفقیت لغو شد";
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("dislike/:productID")
  @Middleware(AuthMiddleware)
  async dislikedProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productID } = req.params;
      await this.productService.findProductWitId(productID);
      const user = req.user;
      const likesProduct = await ProductModel.findOne({
        _id: productID,
        likes: user?._id,
      });
      const disLikesProduct = await ProductModel.findOne({
        _id: productID,
        dislikes: user?._id,
      });
      const findQueryForDislikesProduct = disLikesProduct
        ? { $pull: { dislikes: user?._id } }
        : { $push: { dislikes: user?._id } };
      const findQueryForLikesProduct = likesProduct && {
        $pull: { likes: user?._id },
      };
      await ProductModel.updateOne({ _id: productID }, findQueryForDislikesProduct);
      let message;
      if (!disLikesProduct) {
        if (findQueryForLikesProduct) {
          if (likesProduct) {
            await ProductModel.updateOne({ _id: productID }, findQueryForLikesProduct);
          }
        }
        message = "نپسندیدن محصول با موفقیت انجام شد";
      } else message = "نپسندیدن محصول با موفقیت لغو شد";
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("bookmark/:productID")
  @Middleware(AuthMiddleware)
  async bookmarkedProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productID } = req.params;
      const user = req.user;
      await this.productService.findProductWitId(productID);
      const bookmarkedBlog = await ProductModel.findOne({
        _id: productID,
        bookmarks: user?._id,
      });
      const updateQuery = bookmarkedBlog
        ? { $pull: { bookmarks: user?._id } }
        : { $push: { bookmarks: user?._id } };
      await ProductModel.updateOne({ _id: productID }, updateQuery);
      let message;
      if (!bookmarkedBlog) message = "محصول مورد نظر به لیست علاقه مندی های شما اضافه شد";
      else message = "محصول مورد نظر از لیست علاقه مندی های شما حذف شد";
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
