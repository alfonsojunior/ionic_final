import { ConfiguracaoPage } from './pages/configuracao/configuracao/configuracao.page';
import { ProfessorDbService } from './services/db/professor-db.service';
import { SessaoService } from './services/local/sessao.service';
import { Component, ViewChild } from '@angular/core';

import { Platform, IonRouterOutlet, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { LoginApiService } from './services/api/login-api.service';
import { Professor } from './model/professor.model';
import { ModalService } from './services/local/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  public appPages = [
    {
      title: 'Novo Professores',
      url: 'professor-editar',
      icon: 'person-add'
    },
    {
      title: 'Lista de Professores',
      url: 'professor-lista',
      icon: 'person'
    }
  ];

  public appPages1 = [
    {
      title: 'Configurações',
      url: 'configuracao',
      icon: 'settings'
    },
    {
      title: 'Sair',
      url: 'logout',
      icon: 'log-out'
    }
  ];

  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;

  private modal;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private modalCtrl: ModalController,
    private loginApiService: LoginApiService,
    private sessaoService: SessaoService,
    private professorDbService: ProfessorDbService,
    private modalService: ModalService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.platform.backButton.subscribe(() => {
        if (!this.modalService.isModal) {
          if (this.routerOutlet && this.routerOutlet.canGoBack()) {
            this.routerOutlet.pop();
          } else if (this.router.url === '/login') {
            navigator['app'].exitApp();
          }
        }
      });

    });
  }

  async openPage(page: string) {
    if (page === 'logout') {
      const token = await this.sessaoService.getSessaoToken();
      this.loginApiService.logout(token.token);
      this.router.navigate(['/']);
    } else {
      if (page === 'configuracao') {
        this.modal = await this.modalCtrl.create({
          component: ConfiguracaoPage
        });
        await this.modal.present()
          .then(
            () => {
              this.modalService.isModal = true;
            }
          );
      } else {
        if (page === 'professor-editar') {
          this.professorDbService.currentProfessor = new Professor();
        }
        this.router.navigate([`/${page}`]);
      }
    }
  }

  getActivePage(): string {
    return this.router.url.replace('/', '');
  }
}
