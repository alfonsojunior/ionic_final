import { environment } from './../../../environments/environment';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Injectable } from '@angular/core';
import { Token } from '../../model/token.model';

@Injectable({
  providedIn: 'root'
})
export class SessaoService {

  constructor(private nativeStorage: NativeStorage) { }

  async setSessaoToken(token: Token): Promise<string> {
    return this.nativeStorage.setItem(environment.TOKEN_KEY, token)
      .then(
        () => {
          return 'OK';
        },
        error => {
          console.log('Erro ao gravar o token', error);
          return Promise.reject('Erro ao gravar o token');
        }
      );
  }

  async getSessaoToken(): Promise<Token> {
    return this.nativeStorage.getItem(environment.TOKEN_KEY)
      .then(
        (valor) => {
          return valor;
        },
        error => {
          console.log('Erro ao retornar o token', error);
          return Promise.reject('Erro ao retornar o token');
        }
      );
  }

  async removeSessaoToken(): Promise<string> {
    return this.nativeStorage.remove(environment.TOKEN_KEY)
      .then(
        () => {
          return 'OK';
        },
        error => {
          console.log('Erro ao gravar o token', error);
          return Promise.reject('Erro ao gravar o token ' + error);
        }
      );
  }
}
