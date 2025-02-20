import {Classifier} from "./classifier.model";

export class Menu {
  public id!: number;
  public name!: string;
  public menuPath!: string;
  public description!: string;
  public icon!: string;
  public route!: string;
  public routeReport!: string;
  public root!: Menu;
  public type!: Classifier;
  public mnuOrder!: number;
  public submenus!: Menu[];
  public show!: boolean;
  public first!: number;
}
