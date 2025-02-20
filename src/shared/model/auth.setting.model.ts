import {User} from "./user";

export class AuthSettings {
  constructor(public user?: User,
              public token?: string,
              public tokenIssueDate?: number,
              public tokenExpirationDate?: number) {
  }

  static fromJson(jsonData: any): AuthSettings {
    return Object.assign(new AuthSettings(), jsonData);
  }
}
