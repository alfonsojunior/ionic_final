import { TokenApiService } from './token-api.service';
import { Token } from './../../model/token.model';
import { Injectable } from '@angular/core';
import { Usuario } from '../../model/usuario.model';
import { ConfiguracaoService } from './../local/configuracao.service';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { SessaoService } from './../local/sessao.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class LoginApiService {

  API_URL: string;
  token: Token;

  constructor(
      private http: HttpClient,
      private configuracaoService: ConfiguracaoService,
      private tokenApiService: TokenApiService,
      private sessaoService: SessaoService
    ) { }

  async login(usuario: Usuario): Promise<Token> {
    this.token = new Token();
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          const body = JSON.stringify(usuario);
          this.API_URL = url + 'usuario';
          return this.http.post(`${this.API_URL}/login`, body, httpOptions)
            .toPromise()
            .then(
              async (data: any) => {
                const tk = await this.tokenApiService.getTokenApi(data.token);
                // const dt = new Date(tk.validade);
                // console.log(dt);
                this.token.token = data.token;
                this.token.usuario = usuario.usuario;
                this.token.validade = tk.validade;
                return this.token;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                if (error.status === 401) {
                  return Promise.reject('Erro ao fazer o login');
                } else {
                  return Promise.reject((error.message || error));
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

  async logout(token: string): Promise<boolean> {
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'usuario';
          return this.http.get(`${this.API_URL}/logout/${token}`)
            .toPromise()
            .then(
              async (data) => {
                this.sessaoService.removeSessaoToken();
                return true;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                this.sessaoService.removeSessaoToken();
                if (error.status === 404) {
                  return Promise.reject('Token não encontrado');
                } else {
                  return Promise.reject((error.message || error));
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          this.sessaoService.removeSessaoToken();
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

  async recovery(email: string): Promise<string> {
    const body = JSON.stringify({usuario: '', senha: '', email: email});
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'usuario';
          return this.http.post(`${this.API_URL}/recovery`, body, httpOptions)
            .toPromise()
            .then(
              async (data: any) => {
                return 'Sua senha foi enviada para seu e-mail.';
              }
            )
            .catch(
              async (error: HttpErrorResponse) => {
                if (error.status === 404) {
                  return Promise.reject('E-mail não encontrado');
                } else {
                  return Promise.reject(error.message);
                }
              }
            );
        });
  }
}
