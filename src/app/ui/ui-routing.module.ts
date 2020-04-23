import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { ReportsComponent } from './reports/reports.component';
import { UsersComponent } from './users/users.component';
import { PresentationComponent } from './presentation/presentation.component';
import { SimulationComponent } from './simulation/simulation.component';


const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'projects', component: ProjectsComponent},
  {path: 'reports', component: ReportsComponent},
  {path: 'users', component: UsersComponent},
  {path: 'presentation', component: PresentationComponent},
  {path: 'simulations', component: SimulationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false, anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class UiRoutingModule { }
