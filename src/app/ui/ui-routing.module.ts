import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { ReportsComponent } from './reports/reports.component';
import { UsersComponent } from './users/users.component';
import { PresentationComponent } from './presentation/presentation.component';
import { Simulation1Component } from './simulation1/simulation1.component';
import { Simulation2Component } from './simulation2/simulation2.component';


const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'projects', component: ProjectsComponent},
  {path: 'reports', component: ReportsComponent},
  {path: 'users', component: UsersComponent},
  {path: 'presentation', component: PresentationComponent},
  {path: 'simulation1', component: Simulation1Component},
  {path: 'simulation2', component: Simulation2Component}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false, anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class UiRoutingModule { }
