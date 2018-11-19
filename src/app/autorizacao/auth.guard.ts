import { SessaoService } from './../services/local/sessao.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenApiService } from '../services/api/token-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
      private sessaoService: SessaoService,
      private tokenApiService: TokenApiService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.sessaoService.getSessaoToken()
      .then(
        async token => {
          const date = new Date();
          // console.log(date.toISOString());
          let dtToken = new Date(token.validade);
          // console.log(dtToken.toISOString());
          if (date <= dtToken) {
            return true;
          } else {
            const tk = await this.tokenApiService.getToken();
            dtToken = new Date(tk.validade);
            if (date <= dtToken) {
              return true;
            } else {
              this.router.navigate(['/']);
              return false;
            }
          }
        }
      );

    // return true;
  }
}
