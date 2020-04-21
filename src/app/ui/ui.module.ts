import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { MainComponent } from './layout/main/main.component';
import { ClarityModule } from '@clr/angular';
import { SubnavComponent } from './layout/subnav/subnav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { ReportsComponent } from './reports/reports.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { UiRoutingModule } from './ui-routing.module';
import { DocWrapperComponent } from './layout/doc-wrapper/doc-wrapper.component';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    MainComponent,
    SubnavComponent,
    DashboardComponent,
    ProjectsComponent,
    ReportsComponent,
    UsersComponent,
    SettingsComponent,
    DocWrapperComponent
  ],
  imports: [
    CommonModule,
    ClarityModule,
    UiRoutingModule,
    FlexLayoutModule
  ],
  exports: [
    LayoutComponent,
    DashboardComponent,
    ProjectsComponent,
    ReportsComponent,
    UsersComponent,
    SettingsComponent
  ]
})
export class UiModule { }
