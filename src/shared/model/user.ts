import {Classifier} from "./classifier.model";
import {AccessList} from "./access-list.model";


export class User {
  public id!: number;
  public username!: string;
  public name!: string;
  public password!: string;
  public confirmPassword!: string;
  public enabled: boolean = false;
  public blocked: boolean = false;
  public changePass: boolean = false;
  public expirePass: boolean = false;
  public token!: string;
  public config!: string;
  public accessList!: AccessList;
  public userType!: Classifier;
  public first!: number;

  static fromJson(jsonData: any): User {
    return Object.assign(new User(), jsonData);
  }
}
