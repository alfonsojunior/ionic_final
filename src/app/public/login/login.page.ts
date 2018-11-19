import { File } from '@ionic-native/file/ngx';
import { StructureDbService } from './../../services/db/structure-db.service';
import { ConfiguracaoService } from './../../services/local/configuracao.service';
import { LoginApiService } from './../../services/api/login-api.service';
import { environment } from './../../../environments/environment';
import { Token } from './../../model/token.model';
import { SessaoService } from './../../services/local/sessao.service';
import { Usuario } from './../../model/usuario.model';
import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { TokenApiService } from '../../services/api/token-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public usuario: Usuario = {usuario: 'teste', senha: 'teste'};

  constructor(
      private sessaoService: SessaoService,
      private loginApiService: LoginApiService,
      private alertCtrl: AlertController,
      private router: Router,
      private platform: Platform,
      private file: File,
      private configuracaoService: ConfiguracaoService,
      private structureDbService: StructureDbService,
      private tokenApiService: TokenApiService
    ) { }

  ngOnInit() {
    this.platform.ready()
      .then(
        (ok) => {
          // this.structureDbService.getDbVersion();
          this.structureDbService.createDatabase();
          this.tokenApiService.getToken()
            .then(
              (token: Token) => {
                const agora = new Date();
                const validade = new Date(token.validade);
                if (agora <= validade) {
                  this.router.navigateByUrl('professor-lista');
                }
              }
            );
          this.file.copyFile(
                  this.file.applicationDirectory + 'www/assets/', 'person.png',
                  this.file.externalApplicationStorageDirectory + 'fotos/', 'person.png'
              )
              .then(data => {
                console.log('file copied ', data.fullPath);
              })
              .catch(err => {
                console.log('file not copied ', err.message);
              });
        }
      );
  }

  login() {
    this.loginApiService.login(this.usuario)
      .then(
        (token) => {
          this.sessaoService.setSessaoToken(token)
            .then(
              (mensagem) => {
                // console.log(mensagem);
                this.router.navigateByUrl('professor-lista');
              }
            )
            .catch(
              async (error: Error) => {
                const loginError = await this.alertCtrl.create({
                  header: 'Erro',
                  message: error.message || JSON.stringify(error),
                  buttons: ['OK']
                });
                loginError.present();
              }
            );
        }
      )
      .catch(
        async (error: Error) => {
          const loginError = await this.alertCtrl.create({
            header: 'Erro',
            message: error.message || JSON.stringify(error),
            buttons: ['OK']
          });
          loginError.present();
        }
      );
  }

  async recovery() {
    const alertRecovery = await this.alertCtrl.create({
      header: 'Recuperação de senha',
      message: 'Informe seu e-mail',
      inputs: [
        {
          name: 'email',
          placeholder: 'E-mail',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Confirmar',
          cssClass: 'primary',
          handler: async data => {
            if (data.email !== undefined && data.email !== '') {
              this.loginApiService
                .recovery(data.email)
                .then(
                  async sucesso => {
                    const loginError = await this.alertCtrl.create({
                      header: 'Sucesso',
                      message: sucesso,
                      buttons: ['OK']
                    });
                    loginError.present();
                  }
                )
                .catch(
                  async error => {
                    const loginError = await this.alertCtrl.create({
                      header: 'Erro',
                      message: error,
                      buttons: ['OK']
                    });
                    loginError.present();
                  }
                );
            } else {
              const loginError = await this.alertCtrl.create({
                header: 'Erro',
                message: 'Informe um e-mail.',
                buttons: ['OK']
              });
              loginError.present();
            }
          }
        }
      ]
    });
    alertRecovery.present();
  }

  async configurar() {

    const url = await this.configuracaoService.getApiURL() || '';
    const alertConfig = await this.alertCtrl.create({
      header: 'Configuração da API',
      message: 'Informe a URL da API. <br/>Ex.: http://127.0.0.1:9000/',
      inputs: [
        {
          name: 'url',
          placeholder: 'URL',
          type: 'text',
          value: url
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Confirmar',
          cssClass: 'primary',
          handler: data => {
            // console.log(data.url.endsWith('/'));
            if (!data.url.endsWith('/')) {
              data.url = data.url.trim() + '/';
            }
            this.configuracaoService.setApiURL(data.url);
          }
        }
      ]
    });
    await alertConfig.present();
  }

}
