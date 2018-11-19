import { Router } from '@angular/router';
import { Token } from './../../../model/token.model';
import { ImageService } from './../../../services/local/image.service';
import { ProfessorDbService } from './../../../services/db/professor-db.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Professor } from './../../../model/professor.model';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, ToastController, NavController } from '@ionic/angular';
import { SessaoService } from '../../../services/local/sessao.service';
import { ProfessorApiService } from '../../../services/api/professor-api.service';

@Component({
  selector: 'app-professor-detalhe',
  templateUrl: './professor-detalhe.page.html',
  styleUrls: ['./professor-detalhe.page.scss'],
})
export class ProfessorDetalhePage implements OnInit {

  public professor: Professor = new Professor();
  public avatar: string;
  public status: boolean;
  public token: string;

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
    private professorDbService: ProfessorDbService,
    private professorApiService: ProfessorApiService,
    private imageService: ImageService,
    private sessaoService: SessaoService,
    private actionSheetController: ActionSheetController,
    private toastCtrl: ToastController,
    private nav: NavController,
    private camera: Camera,
    private router: Router
  ) {

  }

  ngOnInit() {
  }

  ionViewDidEnter() {

    this.sessaoService.getSessaoToken()
      .then(
        (token: Token) => {
          this.token = token.token;

          this.professor = this.professorDbService.currentProfessor;
          if (this.professor.status === 'ATIVO') {
            this.status = true;
          } else {
            this.status = false;
          }
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
                        this.imageService.writeFile(foto, 'fotos', arquivo)
                          .catch(
                            (error: Error) => {
                              console.log(error.message);
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
              }
            )
            .catch(
              async (error: Error) => {
                this.professorApiService.getFoto(this.professor.id, this.token)
                    .then(
                      (foto: string) => {
                        this.avatar = foto;
                        this.avatarx.nativeElement.src = 'data:image/png;base64,' + foto;
                        this.imageService.writeFile(foto, 'fotos', arquivo)
                          .catch(
                            (err: Error) => {
                              console.log(err.message);
                            }
                          );
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
      )
      .catch(
        (error: Error) => {
          console.log('Erro ao obter o token ', error.message);
        }
      );
  }

  editar(id: number) {
    this.professorDbService.currentProfessor = new Professor();
    this.professorDbService.getById(id)
      .then(
        (professor: Professor) => {
          this.professorDbService.currentProfessor = professor;
          this.router.navigateByUrl('professor-editar');
        }
      );
  }

  eliminar(id: number) {

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
                      const toast = await this.toastCtrl.create({
                        message: `Professor ${professor.nome} eliminado`,
                        duration: 3000,
                        position: 'bottom',
                        translucent: true
                      });
                      await toast.present();
                      this.nav.goBack();
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
      );

  }

  private obterFoto(sourceType: number) {
    this.options.sourceType = sourceType;
    this.camera.getPicture(this.options)
      .then(async (imageData) => {
        this.avatar = imageData;
        this.avatarx.nativeElement.src = 'data:image/png;base64,' + imageData;
        const arquivo = 'foto_' + this.professor.id + '.png';
        this.imageService.salvarImagem(this.professor.id, this.token, arquivo, imageData)
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

      }).catch((error: Error) => {
        console.log('Erro ao obter a foto', error.message || error);
      });
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

            // this.file.listDir(this.file.externalApplicationStorageDirectory, 'fotos')
            //   .then(
            //     (result) => {
            //       for (const file of result) {
            //         console.log(file.name);
            //       }
            //     }
            //   );

            // this.imageService.readFile('fotos', 'person.png')
            this.imageService.lerImagem('fotos', 'person.png')
              .then(
                (imagem: string) => {

                  // let block = imagem.split(';');
                  // imagem = block[block.length - 1];
                  // block = imagem.split(',');
                  // imagem = block[block.length - 1];

                  this.avatar = imagem;
                  this.avatarx.nativeElement.src = 'data:image/png;base64,' + imagem;
                  const arquivo = 'foto_' + this.professor.id + '.png';
                  this.imageService.salvarImagem(this.professor.id, this.token, arquivo, imagem)
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
