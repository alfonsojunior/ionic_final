import { Router } from '@angular/router';
import { ProfessorDbService } from './../../../services/db/professor-db.service';
import { SessaoService } from './../../../services/local/sessao.service';
import { Platform, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { ProfessorApiService } from './../../../services/api/professor-api.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Professor } from '../../../model/professor.model';

@Component({
  selector: 'app-professor-lista',
  templateUrl: './professor-lista.page.html',
  styleUrls: ['./professor-lista.page.scss'],
})
export class ProfessorListaPage implements OnInit {

  private token: string;
  private ultimo: number;

  private loading: any;

  public professores: Professor[] = [];

  // @ViewChild('refresher') refresher: ElementRef;
  // @ViewChild('infineScroll') infineScroll: ElementRef;
  public refresherEnabled = true;
  public scrollEnabled = true;

  constructor(
    private professorApiService: ProfessorApiService,
    private professorDbService: ProfessorDbService,
    private sessaoService: SessaoService,
    private platform: Platform,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {

    // console.log('ionViewWillEnter');
    this.platform.ready()
      .then(
        async (ok) => {

          this.buscaAPI(null);

        }
      );
  }

  async buscaAPI(evento: any) {

    this.loading = await this.loadingCtrl.create({
      message: 'Carregando...',
      spinner: 'circles'
    });
    await this.loading.present();

    this.ultimo = 0;
    this.professores = [];

    const token = await this.sessaoService.getSessaoToken();
    this.token = token.token;
    this.professorApiService.lista(token.token)
      .then(
        async (professores: Professor[]) => {
          for (const professor of professores) {
            // salvar no banco
            professor.externalId = professor.id;
            this.professorDbService.salvar(professor)
              .then(
                async (prof: Professor) => {
                  // console.log(prof.nome + ' salvo com sucesso');
                  // Carregar apenas os 12 primeiros registros ao entrar na tela
                  if (this.professores.length < 12 ) {
                    this.professores.push(prof);
                    this.ultimo = prof.id;
                    if (evento !== null && evento !== undefined) {
                      evento.target.complete();
                    }
                    await this.loading.dismiss();
                  }
                }
              )
              .catch(
                (error: Error) => {
                  console.log('Erro ' + error.message + ' ao salvar o professor ' + professor.nome);
                }
              );
          }
        }
      )
      .catch(
        async (error: Error) => {
          let toast = await this.toastCtrl.create({
            message: error.message,
            duration: 3000,
            position: 'bottom',
            translucent: true
          });
          await toast.present();

          this.professorDbService.getRegistros(0, 12)
            .then(
              async (professores: Professor[]) => {
                for (const professor of professores) {
                  this.professores.push(professor);
                }
                if (evento !== null && evento !== undefined) {
                  evento.target.complete();
                }
                await this.loading.dismiss();
              }
            )
            .catch(
              async (err: Error) => {
                toast = await this.toastCtrl.create({
                  message: err.message,
                  duration: 3000,
                  position: 'bottom',
                  translucent: true
                });
                await toast.present();
                if (evento !== null && evento !== undefined) {
                  evento.target.complete();
                }
                await this.loading.dismiss();
              }
            );
        }
      );
  }

  buscaRefresher(evento) {
    this.buscaAPI(evento);
  }

  // ionViewDidEnter() {
  //   console.log('ionViewDidEnter');
  // }

  recarregar() {
    this.ultimo = 0;
    this.professores = [];
    this.carregarMais(null);
  }

  carregarMais(evento: any) {
    this.professorDbService.getRegistros(this.ultimo, 12)
      .then(
        (profs: Professor[]) => {
          for (const prof of profs) {
            this.professores.push(prof);
            this.ultimo = prof.id;
          }
          if (evento !== null && evento !== undefined) {
            evento.target.complete();
          }
        }
      );
  }

  loadData(evento) {
    this.carregarMais(evento);
  }

  addProfessor() {
    this.professorDbService.currentProfessor = new Professor();
    this.router.navigateByUrl('professor-editar');
  }

  editProfessor(id: number) {
    this.professorDbService.currentProfessor = new Professor();
    this.professorDbService.getById(id)
      .then(
        (professor: Professor) => {
          this.professorDbService.currentProfessor = professor;
          this.router.navigateByUrl('professor-editar');
        }
      );
  }

  delProfessor(id: number) {
    this.professorDbService.currentProfessor = new Professor();
    this.professorDbService.getById(id)
      .then(
        (professor: Professor) => {
          this.professorDbService.delete(professor.id)
            .then(
              (eliminado) => {
                this.professorApiService.deleteProfessor(professor.externalId, this.token)
                  .then(
                    async (ok) => {
                      this.recarregar();
                      const toast = await this.toastCtrl.create({
                        message: `Professor ${professor.nome} eliminado`,
                        duration: 3000,
                        position: 'bottom',
                        translucent: true
                      });
                      await toast.present();
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
      )
      .catch(
        (error: Error) => {
          this.recarregar();
        }
      );
  }

  detalhes(id: number) {
    this.professorDbService.currentProfessor = new Professor();
    this.professorDbService.getById(id)
      .then(
        (professor: Professor) => {
          this.professorDbService.currentProfessor = professor;
          this.router.navigateByUrl('professor-detalhe');
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

  filter(filtro) {
    let busca: string;
    busca = filtro.srcElement.value;
    if (busca !== '') {
      this.ultimo = 0;
      this.professores = [];
      this.refresherEnabled = false;
      this.scrollEnabled = false;
      // this.refresher.nativeElement.disabled = true;
      // this.infineScroll.nativeElement.disabled = true;

      this.professorDbService.getProfessorSearch(busca)
        .then(
          (profs: Professor[]) => {
            for (const prof of profs) {
              this.professores.push(prof);
              this.ultimo = prof.id;
            }
          }
        );
    } else {
      this.refresherEnabled = true;
      this.scrollEnabled = true;
      // this.refresher.nativeElement.disabled = false;
      // this.infineScroll.nativeElement.disabled = false;
      this.recarregar();
    }
  }

}
