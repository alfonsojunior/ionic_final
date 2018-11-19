import { ModalService } from './../../../services/local/modal.service';
import { ConfiguracaoService } from './../../../services/local/configuracao.service';
import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-configuracao',
  templateUrl: './configuracao.page.html',
  styleUrls: ['./configuracao.page.scss'],
})
export class ConfiguracaoPage implements OnInit {

  public nome: string;
  public linguagem: string;

  constructor(
    private configuracaoService: ConfiguracaoService,
    private modalService: ModalService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {
    this.platform.ready().then(
      () => {
        this.platform.backButton.subscribe(
          () => {
            this.cancelar();
          }
        );
      }
    );
  }

  ngOnInit() {
    this.configuracaoService.getConfiguracao(environment.CONF_NOME)
      .then(
        (valor: string) => {
          this.nome = valor;
        }
      )
      .catch(
        (error: Error) => {
          console.log(error.message);
        }
      );
    this.configuracaoService.getConfiguracao(environment.CONF_LANGUAGE)
      .then(
        (valor: string) => {
          this.linguagem = valor;
        }
      )
      .catch(
        (error: Error) => {
          console.log(error.message);
        }
      );
  }

  ionViewDidLeave() {
    this.modalService.isModal = false;
  }

  gravar() {
    this.configuracaoService.setConfiguracao(environment.CONF_NOME, this.nome)
      .then(
        (ok) => {
          console.log('Nome gravado.');
          this.configuracaoService.setConfiguracao(environment.CONF_LANGUAGE, this.linguagem)
            .then(
              (ok1) => {
                console.log('Linguagem gravada.');
                this.modalCtrl.dismiss();
              }
            )
            .catch(
              async (error: Error) => {
                const toast = await this.toastCtrl.create({
                  message: error.message,
                  duration: 3000,
                  position: 'bottom',
                  translucent: true
                });
                await toast.present();
              }
            );
        }
      )
      .catch(
        async (error: Error) => {
          const toast = await this.toastCtrl.create({
            message: error.message,
            duration: 3000,
            position: 'bottom',
            translucent: true
          });
          await toast.present();
        }
      );
  }

  cancelar() {
    this.modalCtrl.dismiss();
      // .then(
      //   () => {
      //     this.modalService.isModal = false;
      //   }
      // );
  }

}
