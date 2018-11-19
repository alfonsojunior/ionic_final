import { AuthGuard } from './autorizacao/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: './public/login/login.module#LoginPageModule'
  },
  {
    path: 'professor-editar',
    loadChildren: './pages/professor/professor-editar/professor-editar.module#ProfessorEditarPageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'professor-lista',
    loadChildren: './pages/professor/professor-lista/professor-lista.module#ProfessorListaPageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'professor-detalhe',
    loadChildren: './pages/professor/professor-detalhe/professor-detalhe.module#ProfessorDetalhePageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'configuracao',
    loadChildren: './pages/configuracao/configuracao/configuracao.module#ConfiguracaoPageModule',
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
