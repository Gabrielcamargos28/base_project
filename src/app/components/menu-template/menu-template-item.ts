import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {NgClass, NgForOf} from "@angular/common";
import {AppComponent} from "../../app.component";
import {Menu} from "../../../shared/model/menu.model";
import {MenuType} from "../../../shared/enum/menu-type";
import {MenuItemService} from "../../../shared/service/menu-item.service";

@Component({
  /* tslint:disable:component-selector */
  selector: '[app-menuitem]',
  /* tslint:enable:component-selector */
  template: `
    <ng-container *ngIf="showMenu(item)">
      <a [attr.href]="item.url" (click)="itemClick($event)" *ngIf="!item.route || item.submenus"
         (mouseenter)="onMouseEnter()" (keydown.enter)="itemClick($event)"
         [attr.target]="item.target" [attr.tabindex]="0" [ngClass]="item.class" pRipple>
        <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
        <span class="layout-menuitem-text">{{ item.name }}</span>
        <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.submenus"></i>
        <span class="menuitem-badge" *ngIf="item.badge">{{ item.badge }}</span>
      </a>
      <a (click)="itemClick($event)" (mouseenter)="onMouseEnter()" *ngIf="item.route && !item.submenus"
         [routerLink]="item.route" [queryParams]="{path: item.routeReport}"
         routerLinkActive="active-menuitem-routerlink" [ngClass]="item.class"
         [routerLinkActiveOptions]="{exact: !item.preventExact}" [attr.target]="item.target" [attr.tabindex]="0"
         pRipple>
        <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
        <span class="layout-menuitem-text">{{ item.name }}</span>
        <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.submenus"></i>
        <span class="menuitem-badge" *ngIf="item.badge">{{ item.badge }}</span>
      </a>
      <div class="layout-menu-tooltip" *ngIf="item.visible !== false">
        <div class="layout-menu-tooltip-arrow"></div>
        <div class="layout-menu-tooltip-text">{{ item.name }}</div>
      </div>
      <ul *ngIf="(item.submenus && active) && item.visible !== false"
          [@children]="((app.isHorizontal() || app.isSlim()) && root) ? (active ? 'visible' : 'hidden') :
                (active ? 'visibleAnimated' : 'hiddenAnimated')">
        <ng-template ngFor let-child let-i="index" [ngForOf]="item.submenus">
          <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child.badgeClass"></li>
        </ng-template>
      </ul>
    </ng-container>
  `,
  host: {
    '[class.active-menuitem]': 'active'
  },
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    RouterLinkActive,
    NgForOf
  ],
  animations: [
    trigger('children', [
      state('void', style({
        height: '0px'
      })),
      state('hiddenAnimated', style({
        height: '0px'
      })),
      state('visibleAnimated', style({
        height: '*'
      })),
      state('visible', style({
        height: '*',
        'z-index': 100
      })),
      state('hidden', style({
        height: '0px',
        'z-index': '*'
      })),
      transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('void => visibleAnimated, visibleAnimated => void',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class MenuItemComponent implements OnInit, OnDestroy {

  @Input() item: any;
  @Input() index!: number;
  @Input() root!: boolean;
  @Input() parentKey!: string;

  active = false;

  menuSourceSubscription: Subscription;
  menuResetSubscription: Subscription;

  key!: string;

  constructor(public app: AppComponent, public router: Router, private cd: ChangeDetectorRef, private menuService: MenuItemService) {
    this.menuSourceSubscription = this.menuService.menuSource$.subscribe((key: string | string[]) => {
      // deactivate current active menu
      if (this.active && this.key !== key && key.indexOf(this.key) !== 0) {
        this.active = false;
      }
    });

    this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
      this.app.menuHoverActive = false;
      this.active = false;
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(params => {
        if (this.app.isHorizontal() || this.app.isSlim()) {
          this.active = false;
        } else {
          if (this.item.route) {
            this.updateActiveStateFromRoute();
          } else {
            this.active = false;
          }
        }
      });
  }

  ngOnInit() {
    if (!(this.app.isHorizontal() || this.app.isSlim()) && this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }

    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
  }

  updateActiveStateFromRoute() {
    this.active = this.router.isActive(this.item.route[0], !this.item.submenus && !this.item.preventExact);
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // navigate with hover in horizontal mode
    if (this.root) {
      this.app.menuHoverActive = !this.app.menuHoverActive;
    }

    // notify other items
    this.menuService.onMenuStateChange(this.key);

    // execute command
    if (this.item.command) {
      // this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.submenus) {
      this.active = !this.active;
    } else {
      // activate item
      this.active = true;

      // reset horizontal menu
      if (this.app.isHorizontal() || this.app.isSlim()) {
        this.menuService.reset();
      }
    }

    this.app.topbarMenuActive = false;
    this.app.topbarMenuConfigActive = false;
  }

  onMouseEnter() {
    // activate item on hover
    if (this.root && this.app.menuHoverActive && (this.app.isHorizontal() || this.app.isSlim()) && this.app.isDesktop()) {
      this.menuService.onMenuStateChange(this.key);
      this.active = true;
    }
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }

  showMenu(item: Menu): boolean {
    // @ts-ignore
    if ((item.type.value.toUpperCase() == MenuType.portalProduct || item.type.value.toUpperCase() == MenuType.portalReport)
      && ((item.icon != null ? item.icon.indexOf('fa') !== -1 : true))) {

      return true;
    }
    return false;
  }
}
