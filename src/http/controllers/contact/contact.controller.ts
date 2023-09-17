import { Controller, Post, Middleware, Get, Delete } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { StatusCodes } from "http-status-codes";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import {
  CreateAnswerDto,
  CreateContactDto,
} from "../../dtos/contact/contact.dto";
import { IContact } from "../../types/contact/contact.types";
import nodemailer from "nodemailer";
import { ContactService } from "../../services/contact/contact.service";

@Controller("contact")
export class ContactController {
  private contactService: ContactService = new ContactService();
  @Post("add")
  @Middleware(AuthMiddleware)
  async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const createContactDto: CreateContactDto = plainToClass(CreateContactDto, req.body, {
        excludeExtraneousValues: true,
      });
      const contact: IContact | null = await this.contactService.createContact(createContactDto);
      if (!contact) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "ارتباط با موفقیت ایجاد نشد",
            contact,
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "ارتباط با موفقیت ایجاد شد",
          contact,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("list")
  @Middleware(AuthMiddleware)
  async getAllContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts: IContact[] = await this.contactService.getAllContact();
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی ارتباطات موجود با موفقیت بازگردانی شدند",
          contacts,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove/:id")
  @Middleware(AuthMiddleware)
  async removeContact(req: Request, res: Response, next: NextFunction) {
    try {
      const {id}=req.params
      const removeResult: IContact | null = await this.contactService.removeContact(
        id
      );
      if (!removeResult) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "ارتباط مورد نظر یافت نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "ارتباط مورد نظر با موفقیت حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("answer")
  @Middleware(AuthMiddleware)
  async answerContact(req: Request, res: Response, next: NextFunction) {
    try {
      const createAnswerDto: CreateAnswerDto = plainToClass(CreateAnswerDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createAnswerDto);
      const { answer, email } = createAnswerDto;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "www.dariushkhazaei629@gmail.com",
          pass: "xgcm jrbi haww bcxu",
        },
      });
      const mailOptions = {
        from: "www.dariushkhazaei629@gamil.com",
        to: email,
        subject: "پاسخ ایمیل شما از طرف سایت فلان",
        text: answer,
      };
      const contact: IContact | null = await this.contactService.answerContact(createAnswerDto);
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: error,
            },
          });
        } else {
          res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: {
              message: "پاسخ ایمیل با موفقیت ارسال شد",
              contact,
            },
          });
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
