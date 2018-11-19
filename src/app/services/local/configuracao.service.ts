import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoService {

  constructor(private nativeStorage: NativeStorage) { }

  async setApiURL(url: string): Promise<string> {
    return this.nativeStorage.setItem(environment.URL_KEY, url)
      .then(
        () => {
          return 'OK';
        },
        error => {
          console.log('Erro ao gravar a URL', error);
          return Promise.reject('Erro ao gravar a URL ' + error);
        }
      );
  }

  async getApiURL(): Promise<string> {
    return this.nativeStorage.getItem(environment.URL_KEY)
      .then(
        (valor) => {
          return valor;
        },
        (error: Error) => {
          return '';
        }
      );
  }

  async getDbVersion() {
    return this.nativeStorage.getItem(environment.DB_VERSION_KEY)
      .then(
        versao => {
          return versao ? Number( versao ) : 0;
        }
      )
      .catch(
        (error: Error) => {
          return 0;
        }
      );
  }

  setDbVersion(versao: number) {
    this.nativeStorage.setItem(environment.DB_VERSION_KEY, versao);
  }

  async setConfiguracao(key: string, url: string): Promise<boolean> {
    return this.nativeStorage.setItem(key, url)
      .then(
        () => {
          return true;
        },
        error => {
          console.log('Erro ao gravar a URL', error);
          return Promise.reject('Erro ao gravar a URL ' + error);
        }
      );
  }

  async getConfiguracao(key: string): Promise<string> {
    return this.nativeStorage.getItem(key)
      .then(
        (valor) => {
          return valor;
        },
        (error: Error) => {
          return '';
        }
      );
  }

}
