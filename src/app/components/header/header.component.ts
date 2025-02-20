import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { first, firstValueFrom, Observable } from 'rxjs';


import { MessageService } from 'primeng/api';

import { TranslateService } from '@ngx-translate/core';
import {Classifier} from "../../../shared/model/classifier.model";
import {User} from "../../../shared/model/user";
import {Menu} from "../../../shared/model/menu.model";
import {AppComponent} from "../../app.component";
import {HeaderUIDTO} from "../../../shared/dto/header-ui.dto";
import {NgxSpinnerService} from "ngx-spinner";
import {AboutComponent} from "../about/about.component";
import {NgClass} from "@angular/common";



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [
    NgClass
  ],
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  headerUIDTO!: HeaderUIDTO;
  classifierLanguageDTO!: Classifier;
  language!: string;

  userObs!: Observable<User>;
  menuList!: Menu[];

  user!: User;
  userConfig: any;
  showConfigMenu: boolean = false;
  clickButtonLanguageOnChange: boolean = false;

  // DynamicDialog - About
  dynamicDialogRefAbout!: DynamicDialogRef;

  constructor(public appComponent: AppComponent,
              public dialogService: DialogService,
              private ngxSpinnerService: NgxSpinnerService,
              private messageService: MessageService,
              private translateService: TranslateService) {

    this.userObs = this.appComponent.userObs;
  }

  ngOnInit() {

    this.headerUIDTO = new HeaderUIDTO;

    this.user = new User();

    if (this.userObs != null) {

      this.userObs.subscribe(data => {

        this.user = data;
        this.showConfigMenu = false;

        if (this.user != null) {

          this.asyncCallFunctions();

          if (this.user.accessList != null) {

            this.menuList = this.user.accessList.menus;
            if (this.menuList != null && this.menuList.length > 0) {
              this.menuList.forEach(obj => {
                if (obj.type.value == "PORTAL_CONFIG") {
                  this.showConfigMenu = true;
                  return;
                }
              });
            }
          }
        }
      });
    }

  }

  async asyncCallFunctions() {

    this.ngxSpinnerService.show();

    try {
      this.headerUIDTO.error_message_service_Generic = await firstValueFrom(this.translateService.use(this.language).pipe(first()));
    } catch (error) {
      // @ts-ignore
      this.messageService.add({ severity: 'error', summary: '' + this.headerUIDTO.error_message_service_Generic, detail: error.toString() });
    }

    try {
      this.headerUIDTO.error_message_service_Generic = await firstValueFrom(this.translateService.get('error_message_service_Generic').pipe(first()));
    } catch (error) {
      // @ts-ignore
      this.messageService.add({ severity: 'error', summary: '' + this.headerUIDTO.error_message_service_Generic, detail: error.toString() });
    }

    this.ngxSpinnerService.hide();

  }

  onChangeLanguage(language: string) {
    sessionStorage.setItem('language', language);
    this.language = language;
    this.clickButtonLanguageOnChange = true;
    this.asyncCallFunctions();
  }


  isSelectedLanguage(language: string) {
    return sessionStorage.getItem('language') === language;
  }

  openDynamicDialogRefAbout() {

    this.dynamicDialogRefAbout = this.dialogService.open(AboutComponent, {
      showHeader: false,
      width: '400px',
      contentStyle: { "overflow": "auto" },
      baseZIndex: 10000,
      closable: false
    });
  }
}
