import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, from, switchMap } from "rxjs";

@Injectable({providedIn: 'root'})
export class DataService {

  private storageReady = new BehaviorSubject(null);

  constructor() {
    this.init();
  }

  async init() {
    // @ts-ignore
    this.storageReady.next(true);
  }

  getData(key: any) {
    const item = sessionStorage.getItem(key);
    if(item){
      return JSON.parse(<string>sessionStorage.getItem(key));
    }
  }

  addData(key: any, value: any){
    sessionStorage.setItem(key, JSON.stringify(value) );
  }

  removeData(key: any){
    sessionStorage.removeItem(key);
  }

  clearData(){
    sessionStorage.clear();
  }

}
