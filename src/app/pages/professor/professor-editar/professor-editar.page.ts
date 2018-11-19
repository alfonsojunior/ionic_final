import { Token } from './../../../model/token.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController, ToastController, NavController, Platform } from '@ionic/angular';
import { ImageService } from './../../../services/local/image.service';
import { Professor } from './../../../model/professor.model';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SessaoService } from '../../../services/local/sessao.service';
import { ProfessorDbService } from '../../../services/db/professor-db.service';
import { ProfessorApiService } from '../../../services/api/professor-api.service';

@Component({
  selector: 'app-professor-editar',
  templateUrl: './professor-editar.page.html',
  styleUrls: ['./professor-editar.page.scss'],
})
export class ProfessorEditarPage implements OnInit {

  public professor: Professor = new Professor();
  public avatar: string;
  public status: boolean;
  private token: string;
  public nascimento: any;

  @ViewChild('avatar') avatarx: ElementRef;

  private options: CameraOptions = {
    allowEdit: true,
    quality: 50,
    // destinationType: this.camera.DestinationType.FILE_URI,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.PNG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    saveToPhotoAlbum: false,
    correctOrientation: true
  };

  constructor(
    private professorApiService: ProfessorApiService,
    private imageService: ImageService,
    private sessaoService: SessaoService,
    private professorDbService: ProfessorDbService,
    private actionSheetController: ActionSheetController,
    private toastCtrl: ToastController,
    private camera: Camera,
    private nav: NavController,
    private platform: Platform
  ) {

  }

  ngOnInit() {

    this.platform.ready()
      .then(
        async (ok) => {

          const token = await this.sessaoService.getSessaoToken();
          this.token = token.token;

          this.professor = this.professorDbService.currentProfessor;
          if (this.professor.status === 'ATIVO') {
            this.status = true;
          } else {
            this.status = false;
          }
          this.nascimento = this.professor.nascimento;
          const arquivo = 'foto_' + this.professor.id + '.png';
          this.imageService.lerImagem('fotos', arquivo)
            .then(
              (imagem: string) => {
                if (imagem !== '') {
                  this.avatar = imagem;
                  this.avatarx.nativeElement.src = 'data:image/png;base64,' + imagem;
                } else {
                  this.professorApiService.getFoto(this.professor.id, this.token)
                    .then(
                      (foto: string) => {
                        this.avatar = foto;
                        this.avatarx.nativeElement.src = 'data:image/png;base64,' + foto;
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
              }
            )
            .catch(
              async (error: Error) => {
                this.professorApiService.getFoto(this.professor.id, this.token)
                    .then(
                      (foto: string) => {
                        this.avatar = foto;
                        this.avatarx.nativeElement.src = 'data:image/png;base64,' + foto;
                      }
                    )
                    .catch(
                      async (erro: Error) => {
                        const toast = await this.toastCtrl.create({
                          message: erro.message,
                          duration: 3000,
                          position: 'bottom',
                          translucent: true
                        });
                        await toast.present();
                      }
                    );
              }
            );
        }
      );
  }

  gravar() {

    if (this.status) {
      this.professor.status = 'ATIVO';
    } else {
      this.professor.status = 'INATIVO';
    }
    this.professor.nascimento = this.nascimento.toString();
    this.professorDbService.salvar(this.professor)
      .then(
        (prof: Professor) => {
          this.professorApiService.postProfessor(prof, this.token)
            .then(
              (prof1: Professor) => {
                prof.externalId = prof1.id;
                this.professorDbService.salvar(prof);
                this.professorDbService.currentProfessor = prof;
                const arquivo = 'foto_' + prof.id + '.png';
                this.imageService.salvarImagem(prof.externalId, this.token, arquivo, this.avatar)
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
                this.cancelar();
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
    this.nav.goBack();
  }

  private obterFoto(sourceType: number) {
    this.options.sourceType = sourceType;
    this.camera.getPicture(this.options)
      .then(
        async (imageData) => {
          this.avatar = imageData;
          this.avatarx.nativeElement.src = 'data:image/png;base64,' + imageData;
        }
      ).catch(
        async (error: Error) => {
          console.log('Erro ao obter a foto', error.message || error);
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

  async trocarFoto() {

    const actionSheet = await this.actionSheetController.create({
      header: 'Escolha sua ação',
      animated: true,
      buttons: [
        {
          text: 'Carregar foto da galeria',
          icon: 'images',
          handler: () => {
            this.obterFoto(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }, {
          text: 'Tirar foto usando a câmera',
          icon: 'camera',
          handler: () => {
            this.obterFoto(this.camera.PictureSourceType.CAMERA);
          }
        }, {
          text: 'Colocar avatar padrão',
          icon: 'contact',
          handler: () => {
            console.log('Avatar padrão');

            this.imageService.lerImagem('fotos', 'person.png')
              .then(
                (imagem: string) => {

                  this.avatar = imagem;
                  this.avatarx.nativeElement.src = 'data:image/png;base64,' + imagem;
                  const arquivo = 'foto_' + this.professor.id + '.png';
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
        }, {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();

  }

}
