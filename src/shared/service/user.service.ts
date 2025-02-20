import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../model/user';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get<User[]>(`${environment.api}/protected/user/listAll`);
  }

  getByUsername(user: User) {
    return this.httpClient.post<User>(`${environment.api}/protected/user/getByUsername`, user);
  }

  getById(id: number) {
    return this.httpClient.get<User>(`${environment.api}/protected/user/${id}`);
  }

  getById2(id: number) {
    return this.httpClient.get<User>(`${environment.api}/protected/user/${id}`,
      {
        observe: 'response'
      });
  }

  changePassword(user: User) {
    return this.httpClient.post<User>(`${environment.api}/protected/user/changePassword`, user);
  }

  getCurrent() {
    return this.httpClient.get<User>(`${environment.api}/protected/user/loggedUser`);
  }

  search(user: User) {
    return this.httpClient.post<User[]>(`${environment.api}/protected/user/search`, user);
  }

  save(user: User) {
    return this.httpClient.post<User>(`${environment.api}/protected/user/save`, user);
  }

  delete(id: number) {
    return this.httpClient.delete<boolean>(`${environment.api}/protected/user/${id}`);
  }
}
