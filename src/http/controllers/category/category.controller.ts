import { Controller, Post, Middleware, Get, Delete, Patch } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateCategoryDto } from "../../dtos/category/category.dto";
import { FunctionUtils } from "../../../utils/functions";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { Upload } from "../../../utils/multer";
import { CategoryModel } from "../../models/category/category.model";
import { StatusCodes } from "http-status-codes";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { CategoryService } from "../../services/category/category.service";
import { ICategory } from "../../types/category/category.types";

@Controller("category")
export class CategoryController {
  private categoryService: CategoryService = new CategoryService();
  @Post("add")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 1))
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const createCategoryDto: CreateCategoryDto = plainToClass(CreateCategoryDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createCategoryDto);
      const { title, parent } = createCategoryDto;
      const files = req.files as { [filename: string]: Express.Multer.File[] };
      if (Array.isArray(files)) {
        const images = FunctionUtils.ListOfImagesForRequest(files, req.body.fileUploadPath);
        await this.findCategoryWithTitle(title, res);
        const category = await CategoryModel.create({ title, parent, images });
        if (!category) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: "خطای داخلی || دسته بندی مورد نظر ایجاد نشد",
            },
          });
        }

        res.status(StatusCodes.CREATED).json({
          statusCode: StatusCodes.CREATED,
          data: {
            message: "دسته بندی مورد نظر با موفقیت ایجاد شد",
            category,
          },
        });
      }
    } catch (err) {
      FunctionUtils.deleteFileInPublic(req?.body?.images);
      next(err);
    }
  }

  @Get("list")
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories: ICategory[] | null = await this.categoryService.getAllCategories();
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی دسته بندی های موجود با موفقیت بازگردانده شدند",
          categories,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove/:field")
  @Middleware(AuthMiddleware)
  removeCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { field } = req.params;
      const category: ICategory | null = await this.categoryService.findCategoryWithTitleOrID(
        field
      );
      if (category) {
        const removeResult = await CategoryModel.deleteMany({
          $or: [{ _id: category._id }, { parent: category._id }],
        });
        if (!removeResult.deletedCount) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: "حذف دسته بندی با موفقیت انجام نشد",
            },
          });
        }
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "حذف دسته بندی با موفقیت انجام شد",
          },
        });
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "دسته بندی مورد نظر یافت نشد",
          },
        });
      }
    } catch (err) {
      next(err);
    }
  };

  @Patch("update/:field")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 1))
  async updateCategoryTitle(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [filename: string]: Express.Multer.File[] };
      if (Array.isArray(files)) {
        const images = FunctionUtils.ListOfImagesForRequest(files, req.body.fileUploadPath);
        const { field } = req.params;
        const { title } = req.body;
        const category: ICategory | null = await this.categoryService.findCategoryWithTitleOrID(
          field
        );
        if (category) {
          const updateResult = await CategoryModel.updateOne(
            { _id: category._id },
            { $set: { title, images } }
          );
          if (!updateResult.modifiedCount) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
              data: {
                message: "به روزرسانی دسته بندی با موفقیت انجام نشد",
              },
            });
          }

          return res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: {
              message: "به روزرسانی دسته بندی با موفقیت انجام شد",
            },
          });
        } else {
          return res.status(StatusCodes.NOT_FOUND).json({
            statusCode: StatusCodes.NOT_FOUND,
            data: {
              message: "دسته بندی مورد نظر یافت نشد",
            },
          });
        }
      }
    } catch (err) {
      FunctionUtils.deleteFileInPublic(req?.body?.images);
      next(err);
    }
  }

  @Get("getOne/:field")
  @Middleware(AuthMiddleware)
  async getOneCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { field } = req.params;
      const category: ICategory | null = await this.categoryService.findCategoryWithTitleOrID(
        field
      );
      if (category) {
        const getCategory = await CategoryModel.aggregate([
          {
            $match: { _id: category._id },
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "parent",
              as: "children",
            },
          },
          {
            $project: {
              __v: 0,
              "children.__v": 0,
              "children.parent": 0,
            },
          },
        ]);
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "دسته بندی مورد نظر با موفقیت بازگردانده شد",
            getCategory,
          },
        });
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "دسته بندی مورد نظر یافت نشد",
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Get("children/:parent")
  async getChildrenOfParent(req: Request, res: Response, next: NextFunction) {
    try {
      const { parent } = req.params;
      const children = await CategoryModel.find({ parent }, { __v: 0, parent: 0 }).lean();
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی زیرمجموعه های پرنت مورد نظر بازگردانده شدند",
          children,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async findCategoryWithTitle(title: string, res: Response) {
    const category = await CategoryModel.findOne({ title });
    if (category) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: {
          message: "دسته بندی مورد نظر از قبل ایجاد شده است",
        },
      });
    }
  }
}
