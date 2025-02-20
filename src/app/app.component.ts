import { ConfirmationService, Message, MessageService, PrimeNGConfig, Translation} from 'primeng/api';
import {Component, OnInit} from "@angular/core";
import {DialogService} from "primeng/dynamicdialog";
import {BehaviorSubject, Observable} from "rxjs";
import {Router, RouterOutlet} from "@angular/router";
import {User} from "../shared/model/user";
import {UserService} from "../shared/service/user.service";
import {MenuItemService} from "../shared/service/menu-item.service";
import {AuthenticationService} from "../shared/service/authentication.service";
import {systemEnvironment} from "../environments/system-environment";
import {environment} from "../environments/environment";
import {TranslateService} from "@ngx-translate/core";
import {NgClass} from "@angular/common";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {FooterComponent} from "./components/footer/footer.component";
import {HeaderComponent} from "./components/header/header.component";
import {NgxSpinnerComponent} from "ngx-spinner";
import {MenuTemplateComponent} from "./components/menu-template/menu-template.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TranslateService, ConfirmationService, DialogService, MessageService, PrimeNGConfig],
  imports: [
    NgClass,
    ToastModule,
    ConfirmDialogModule,
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    NgxSpinnerComponent,
    MenuTemplateComponent
  ],
  standalone: true
})
export class AppComponent implements OnInit {
  topbarColor = 'layout-topbar-bluegrey';
  title = 'base-project';
  theme = 'blue-orange';
  menuMode = 'static';

  staticMenuDesktopInactive: boolean | undefined;
  staticMenuMobileActive: boolean | undefined;
  topbarMenuConfigActive!: boolean;
  overlayMenuActive: boolean | undefined;
  topbarMenuActive!: boolean;
  menuHoverActive!: boolean;
  topbarItemClick!: boolean;
  menuClick!: boolean;
  resetMenu!: boolean;
  lightMenu = true;

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  userDefault!: User;
  userConfig: any;
  userObs: Observable<User>;

  msgs: Message[] = [];

  layoutMenuScroller!: HTMLDivElement;

  // @ts-ignore
  displayNewModal: boolean;
  displayViewModal!: boolean;

  constructor(private translateService: TranslateService,
              private authService: AuthenticationService,
              private userService: UserService,
              private menuService: MenuItemService,
              private primengConfig: PrimeNGConfig,
              private router: Router) {
    this.userObs = this.authService.userObs;
    this.currentUserSubject = new BehaviorSubject<User>(this.userDefault);
    this.currentUser = this.currentUserSubject.asObservable();
    this.translateService.setDefaultLang('pt');
  }


  ngOnInit() {
    this.authService.checkUserStorage();
    this.showVersion();

    this.userObs.subscribe({
      next: (user) => {
        if (user) {
          this.setUserData(user);
        }
      }, error: (reason) => {
        console.error('Erro ao carregar menus:', reason);
      }
    });

    Date.prototype.toISOString = function () {
      const offset = -this.getTimezoneOffset();
      const timezoneOffset = (offset >= 0 ? '+' : '-') +
        ('0' + Math.abs(offset / 60)).toString().padStart(2, '0') +
        ('0' + (Math.abs(offset) % 60)).toString().padStart(2, '0');

      const formattedDate = this.getFullYear() +
        '-' + ('0' + (this.getMonth() + 1)).slice(-2) +
        '-' + ('0' + this.getDate()).slice(-2) +
        'T' + ('0' + this.getHours()).slice(-2) +
        ':' + ('0' + this.getMinutes()).slice(-2) +
        ':' + ('0' + this.getSeconds()).slice(-2) +
        '.' + ('00' + this.getMilliseconds()).slice(-3) +
        'Z';

      return formattedDate;
    };

    this.msgs = [];
    this.changeTheme(this.theme);
  }

  translate(lang: string) {
    this.translateService.use(lang);
    this.translateService.get('primeng').subscribe((res: Translation) => this.primengConfig.setTranslation(res));

    this.primengConfig.setTranslation({
      firstDayOfWeek: 0,
      dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Se', 'Sa'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar',
      dateFormat: 'dd/mm/yy',
      weekHeader: 'FdS',
      emptyMessage: 'Nenhum resultado encontrado!',
      emptyFilterMessage: 'Nenhum resultado encontrado!',
      accept: 'Sim',
      reject: 'Não'
    });
  }

  setUserData(user: User) {
    this.userDefault = user;
    this.currentUserSubject.next(this.userDefault);

    if (this.userDefault != null) {
      if (this.userDefault.config != null) {
        this.userConfig = JSON.parse(this.userDefault.config);
        if (this.userConfig != null) {
          this.changeMenuMode(this.userConfig.menuStyle);
          this.changeTheme(this.userConfig.theme);
          this.lightMenu = this.userConfig.lightMenu;
          this.topbarColor = this.userConfig.topbarColor;
        }
      }
    }
  }

  logout() {
    // @ts-ignore
    this.currentUserSubject.next(null);
    // this.currentUser = null;
    this.authService.logout();
  }

  changeTheme(theme: string) {
    const layoutLink: HTMLLinkElement = document.getElementById('layout-css') as HTMLLinkElement;
    layoutLink.href = 'assets/layout/css/layout-' + theme.split('-')[0] + '.css';
    const themeLink: HTMLLinkElement = document.getElementById('theme-css') as HTMLLinkElement;
    themeLink.href = 'assets/theme/' + 'theme-' + theme + '.css';
  }

  onLayoutClick() {
    if (!this.topbarItemClick) {
      this.topbarMenuActive = false;
      this.topbarMenuConfigActive = false;
    }

    if (!this.menuClick) {
      if (this.isHorizontal() || this.isSlim()) {
        this.menuService.reset();
      }

      if (this.overlayMenuActive || this.staticMenuMobileActive) {
        this.hideOverlayMenu();
      }

      this.menuHoverActive = false;
    }

    this.topbarItemClick = false;
    this.menuClick = false;
  }

  onMenuButtonClick(event: any) {
    this.menuClick = true;
    this.topbarMenuActive = false;

    if (this.isOverlay()) {
      this.overlayMenuActive = !this.overlayMenuActive;
    }
    if (this.isDesktop()) {
      this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
    } else {
      this.staticMenuMobileActive = !this.staticMenuMobileActive;
    }

    event.preventDefault();
  }

  onMenuClick($event: any) {
    this.menuClick = true;
    this.resetMenu = false;
  }

  onTopbarMenuButtonClick(event: any) {
    this.topbarItemClick = true;
    this.topbarMenuConfigActive = false;
    this.topbarMenuActive = !this.topbarMenuActive;
    this.hideOverlayMenu();
    event.preventDefault();
  }

  onTopbarMenuButtonClickConfig(event: any) {
    this.topbarItemClick = true;
    this.topbarMenuActive = false;
    this.topbarMenuConfigActive = !this.topbarMenuConfigActive;
    this.hideOverlayMenu();
    event.preventDefault();
  }

  onTopbarSubItemClick(event: any) {
    event.preventDefault();
  }

  isHorizontal() {
    return this.menuMode === 'horizontal';
  }

  isSlim() {
    return this.menuMode === 'slim';
  }

  isOverlay() {
    return this.menuMode === 'overlay';
  }

  isStatic() {
    return this.menuMode === 'static';
  }

  isMobile() {
    return window.innerWidth < 1025;
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }

  isTablet() {
    const width = window.innerWidth;
    return width <= 1024 && width > 640;
  }

  hideOverlayMenu() {
    this.overlayMenuActive = false;
    this.staticMenuMobileActive = false;
  }

  changeMenuMode(menuMode: string) {
    this.menuMode = menuMode;
    this.staticMenuDesktopInactive = false;
    this.overlayMenuActive = false;
  }

  navigateToRoute(route: string) {
    if (route.startsWith("http://") || route.startsWith("https://")) {
      window.open(route, "_blank");
    } else {
      this.topbarMenuActive = false;
      this.topbarMenuConfigActive = false;
      this.router.navigate([route]);
    }
  }

  showVersion() {
    console.log(`${systemEnvironment.systemName} - ${environment.environmentName} - v${systemEnvironment.versionNumber} - ${systemEnvironment.versionDate}`);
  }

}
