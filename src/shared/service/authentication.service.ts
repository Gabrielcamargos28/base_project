import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataService } from './data.service';

import { Router } from '@angular/router';
import {User} from "../model/user";
import {environment} from "../../environments/environment";
import {AuthSettings} from "../model/auth.setting.model";
import {TokenUtils} from "../util/token.util";
import moment from "moment";

;

const USER_SETTINGS_KEY = 'USER_SETTINGS';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private authorizeEndpoint = '/oauth2/authorization/ifood';
  private tokenEndpoint = '/login/oauth2/code/ifood';

  private userSub: BehaviorSubject<User>;
  public userObs: Observable<User>;

  constructor(private http: HttpClient,  private router: Router, private dataService: DataService) {
    this.userSub = new BehaviorSubject<User>(dataService.getData(USER_SETTINGS_KEY));
    this.userObs = this.userSub.asObservable();
  }

  public get currentUserValue(): User {
    return this.userSub.getValue();
  }

  fetchToken(code: string, state: string, scope: any): Observable<any> {
    return this.http.get<any>(environment.api + this.tokenEndpoint + '?code=' + code + '&state=' + state);
  }

  updateToken(token: string) {
    const decodedData = TokenUtils.parseJwt(token);
    const authUser = new User()
    const authSettings: AuthSettings = new AuthSettings(
      authUser, token, decodedData.created, decodedData.exp
    );
    this.dataService.addData(USER_SETTINGS_KEY, authSettings);
    if (authSettings.user instanceof User) {
      this.userSub.next(authSettings.user);
    }
  }

  getLoggedUser(): Observable<User> {
    // @ts-ignore
    return this.http.get<User>(`${environment.api}/protected/user/loggedUser`).pipe(
      map(user => {
        if (user ) {
          const userSettings = this.dataService.getData(USER_SETTINGS_KEY);
          this.dataService.removeData(USER_SETTINGS_KEY);

          const authUser = User.fromJson(user);
          authUser.token = userSettings.token
          const authSettingsNew: AuthSettings = new AuthSettings(
            authUser, userSettings.token , userSettings.created, userSettings.exp
          );

          this.dataService.addData(USER_SETTINGS_KEY, authSettingsNew);
          if (authSettingsNew.user instanceof User) {
            this.userSub.next(authSettingsNew.user);
          }

          return authSettingsNew.user;
        }
        throw new TypeError('Server returned null');
      })
    );
  }

  checkUserStorage(): boolean {
    const userSettings = this.dataService.getData(USER_SETTINGS_KEY);
    if(userSettings && userSettings.user){
      this.userSub.next(userSettings.user);
      return true;
    }

    return false;
  }

  getUser(): User | null {
    if(this.userSub){
      const userSettings = this.dataService.getData(USER_SETTINGS_KEY);
      if (userSettings) {
        if (moment().valueOf() >= (userSettings.tokenExpirationDate * 1000)) {
          this.logout();
          return null;
        }
        return userSettings.user;
      }
    }

    return null;
  }

  getToken(): string | null {
    if(this.userSub){
      const userSettings = this.dataService.getData(USER_SETTINGS_KEY);
      if (userSettings) {
        if (moment().valueOf() >= (userSettings.tokenExpirationDate * 1000)) {
          this.logout();
          return null;
        }
        return userSettings.token;
      }
    }

    return null;
  }

  login(username: string, password: string):Observable<User> {
    return this.http.post<any>(`${environment.api}/auth`, { username, password }).pipe(
      map(user => {
        if (user && user.token) {
          const decodedData = TokenUtils.parseJwt(user.token);
          const authUser = User.fromJson(user);
          const authSettings: AuthSettings = new AuthSettings(
            authUser, user.token, decodedData.created, decodedData.exp
          );

          this.dataService.addData(USER_SETTINGS_KEY, authSettings);
          if (authSettings.user instanceof User) {
            this.userSub.next(authSettings.user);
          }

          return authUser;
        }
        throw new TypeError('Server returned null');
      })
    );
  }

  loginSSO() {
    window.open(environment.api+ this.authorizeEndpoint, '_self');
  }

  logout() {
    this.dataService.removeData(USER_SETTINGS_KEY);
    this.dataService.clearData();
    // @ts-ignore
    this.userSub.next(null);
    // this.userObs = null;
    this.router.navigate(['login']);
  }

}
