import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {User} from "../../../shared/model/user";
import {Menu} from "../../../shared/model/menu.model";
import {AppComponent} from "../../app.component";
import {MenuItemComponent} from "./menu-template-item";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-menu-template',
  standalone: true,
  imports: [
    MenuItemComponent,
    AsyncPipe
  ],
  templateUrl: './menu-template.component.html'
})
export class MenuTemplateComponent implements OnInit {

  userObs: Observable<User>;
  user!: User;
  menuList!: Menu[];

  constructor(public app: AppComponent) {
    this.userObs = this.app.currentUser;
  }

  ngOnInit() {
    this.user = new User();

    this.userObs.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          if (this.user.accessList != null) {
            this.menuList = this.user.accessList.menus;
          }
        }
      }, error: (reason) => {
        console.error('Erro ao carregar menus:', reason);
      }
    });
  }

  onMenuClick(event: any) {
    if (!this.app.isHorizontal()) {
    }
    this.app.onMenuClick(event);
  }

}
