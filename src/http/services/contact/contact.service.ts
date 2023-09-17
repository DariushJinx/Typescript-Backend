import { errorHandler } from "../../../utils/ApiErrorHandler";
import {
  CreateAnswerDto,
  CreateContactDto,
} from "../../dtos/contact/contact.dto";
import { ContactModel } from "../../models/contact/contact.model";
import { IContact } from "../../types/contact/contact.types";

export class ContactService {
  async createContact(createContactDto: CreateContactDto): Promise<IContact | null> {
    errorHandler(createContactDto);
    const { name, email, phone, body } = createContactDto;
    const contact: IContact | null = await ContactModel.create({
      name,
      email,
      phone,
      body,
      answer: false,
    });

    return contact;
  }

  async getAllContact(): Promise<IContact[]> {
    const contacts: IContact[] = await ContactModel.find({});
    return contacts;
  }

  async removeContact(id: string): Promise<IContact | null> {
    const removeResult: IContact | null = await ContactModel.findOneAndRemove({ _id: id });
    return removeResult;
  }

  async answerContact(createAnswerDto: CreateAnswerDto): Promise<IContact | null> {
    errorHandler(createAnswerDto);
    const { answer, email } = createAnswerDto;
    const contact: IContact | null = await ContactModel.findOneAndUpdate(
      { email: email },
      { answer: true }
    );
    return contact;
  }
}
