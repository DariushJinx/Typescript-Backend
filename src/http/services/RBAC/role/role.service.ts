import createHttpError from "http-errors";
import { RoleModel } from "../../../models/RBAC/role/role.model";
import { IRole } from "../../../types/RBAC/role/role.types";
import mongoose from "mongoose";
import { CreateRoleDto } from "../../../dtos/RBAC/role/role.dto";
import { errorHandler } from "../../../../utils/ApiErrorHandler";

export class RoleService {
  async findRoleWithTitleOrID(field: string) {
    const findQuery:
      | {
          _id: string;
          title?: undefined;
        }
      | {
          title: string;
          _id?: undefined;
        } = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
    const role: IRole | null = await RoleModel.findOne(findQuery);
    if (!role) {
      throw createHttpError.NotFound("نقش مورد نظر یافت نشد");
    }
    return role;
  }

  async findRoleWithTitle(title: string): Promise<void> {
    const role: IRole | null = await RoleModel.findOne({ title });
    if (role) {
      throw createHttpError.BadRequest("نقش مورد نظر قبلا ایجاد شده است");
    }
  }

  async createNewRole(createRoleDto: CreateRoleDto): Promise<IRole> {
    errorHandler(createRoleDto);
    const { title, description, permissions } = createRoleDto;
    await this.findRoleWithTitle(title);
    const roles: IRole = await RoleModel.create({ title, description, permissions });
    return roles;
  }

  async getAllRoles(): Promise<IRole[]> {
    const roles: IRole[] = await RoleModel.find({});
    return roles;
  }
}
