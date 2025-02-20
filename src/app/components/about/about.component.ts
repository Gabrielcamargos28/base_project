import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import {systemEnvironment} from "../../../environments/system-environment";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  standalone: true,
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  systemName: string;
  versionNumber: string;
  versionDate: string;
  environmentName: string;

  constructor(private dynamicDialogRef: DynamicDialogRef) {

    this.systemName = systemEnvironment.systemName;
    this.versionDate = systemEnvironment.versionDate;
    this.versionNumber = systemEnvironment.versionNumber;
    this.environmentName = environment.environmentName;
  }

  ngOnInit(): void {
  }

  close() {
    this.dynamicDialogRef.close();
  }
}
