import { ConfiguracaoService } from './../local/configuracao.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { SessaoService } from './../local/sessao.service';
import { Injectable } from '@angular/core';
import { Token } from '../../model/token.model';

@Injectable({
  providedIn: 'root'
})
export class TokenApiService {

  private API_URL: string;
  private token: Token = new Token();

  constructor(
      private http: HttpClient,
      private sessaoService: SessaoService,
      private configuracaoService: ConfiguracaoService
  ) { }

  async getToken(): Promise<Token> {

    return this.sessaoService.getSessaoToken()
      .then(
        async (token) => {
          this.token = token;
          return this.configuracaoService.getApiURL()
            .then(
              async (url) => {
                this.API_URL = url + 'usuario';
                return this.http.get(`${this.API_URL}/token/${token.token}`)
                  .toPromise()
                  .then(
                    (data: any) => {
                      if (data !== undefined && data !== null) {
                        if (data.validade !== '' && data.validade !== undefined) {
                          this.token.validade = data.validade;
                        }
                      }
                      return this.token;
                    }
                  )
                  .catch(
                    error => {
                      return this.token;
                    }
                  );
              }
            )
            .catch(
              (error: Error) => {
                return Promise.reject('URL da API não configurada.');
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('Token não encontrado.');
        }
      );
  }

  async getTokenApi(tkString: string): Promise<Token> {

    this.token = new Token();
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'usuario';
          return this.http.get(`${this.API_URL}/token/${tkString}`)
            .toPromise()
            .then(
              (data: any) => {
                if (data !== undefined && data !== null) {
                  if (data.validade !== '' && data.validade !== undefined) {
                    this.token.validade = data.validade;
                  }
                }
                return this.token;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                return Promise.reject(error.message);
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('URL da API não configurada.');
        }
      );
  }

}
