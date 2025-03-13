import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";


const routes: Routes = [
  {
    path:'',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
  },
  {
    path:':path',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
  }
] as Routes;
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutesModule {}