import { Base64 } from '@ionic-native/base64/ngx';
import { File, FileError, DirectoryEntry, FileEntry } from '@ionic-native/file/ngx';
import { Injectable } from '@angular/core';
import { ProfessorApiService } from '../api/professor-api.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(
    private professorApiService: ProfessorApiService,
    private file: File,
    private base64: Base64
  ) { }

  private getContentType(base64Data: any) {
    const block = base64Data.split(';');
    const contentType = block[0].split(':')[1];
    return contentType || 'data:image/png;base64';
  }

  private base64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {
        type: contentType
    });
    return blob;
  }

  private async createFolder(path: string, folder: string, replace: boolean): Promise<boolean> {
    return this.file.createDir(path, folder, replace)
      .then((success) => {
        // console.log('OK_FL', success);
        return true;
      })
      .catch((error: FileError) => {
        if (error.code === 12) {
          return true;
        } else {
          // console.log('Erro ao criar o diretorio', error);
          Promise.reject('Erro ao criar o diretorio' + error);
        }
      });
  }

  public writeFile(base64Data: any, folderName: string, fileName: string): Promise<boolean> {
    const contentType = this.getContentType(base64Data);
    const DataBlob = this.base64toBlob(base64Data, contentType);
    const filePath = this.file.externalApplicationStorageDirectory + folderName;
    return this.createFolder(this.file.externalApplicationStorageDirectory, folderName, false)
      .then((success) => {
        // console.log('OK_FL', success);

        return this.file.createFile(filePath, fileName, true)
          .then((success1) => {
            console.log('OK_CR', success1);

            return this.file.writeFile(filePath, fileName, DataBlob, { replace: true })
              .then((success2) => {
                console.log('OK_GR', success2);
                return true;
              }).catch((error: Error) => {
                console.log('Erro ao gravar o arquivo', error);
                return Promise.reject('Erro ao gravar o arquivo' + error.message);
              });

          })
          .catch((error: Error) => {
            console.log('Erro ao criar o arquivo', error);
            return Promise.reject('Erro ao criar o arquivo' + error.message);
          });

      })
      .catch((error: Error) => {
        console.log('Erro ao criar o diretorio', error);
        return Promise.reject('Erro ao criar o diretorio' + error.message);
      });
  }

  public async readFile(folderName: string, fileName: any): Promise<string> {
    let filePath = this.file.externalApplicationStorageDirectory + folderName;
    if (!filePath.endsWith('/') && !filePath.endsWith('\\')) {
      filePath += '/';
    }
    filePath += fileName;
    return this.base64.encodeFile(filePath)
      .then(
        (base64File: string) => {
          return base64File;
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject(error.message || error);
        }
      );
  }

  public async readFileAssets(fileName: string): Promise<string> {

    // this.file.listDir(filePath, '')
    //   .then(
    //     (result) => {
    //       for (const file of result) {
    //         console.log(file.name);
    //       }
    //     }
    //   );

    console.log(fileName);

    return this.base64.encodeFile(fileName)
      .then(
        (base64File: string) => {
          console.log(base64File);
          return base64File;
        }
      )
      .catch(
        (error: Error) => {
          console.log('Erro ao obter o Base64 do arquivo', error.message);
          return Promise.reject(error.message || error);
        }
      );
  }

  async imageExists(folderName: string, fileName: any): Promise<boolean> {
    let filePath = this.file.externalApplicationStorageDirectory + folderName;
    if (!filePath.endsWith('/') && !filePath.endsWith('\\')) {
      filePath += '/';
    }
    return this.file.checkFile(filePath, fileName);
  }

  private getImagePath(folderName: string): string {
    let filePath = this.file.externalApplicationStorageDirectory + folderName;
    if (!filePath.endsWith('/') && !filePath.endsWith('\\')) {
      filePath += '/';
    }
    return filePath;
  }

  public async lerImagem(folder: string, imgFile: string): Promise<string> {
    return this.readFile(folder, imgFile)
      .then(
        (imagem: string) => {

          let block = imagem.split(';');
          imagem = block[block.length - 1];
          block = imagem.split(',');
          imagem = block[block.length - 1];

          return imagem;

        }
      )
      .catch(
        async (error: Error) => {
          console.log('Erro ao obter o avatar padrão ', error.message);
          return Promise.reject(error.message);
        }
      );
  }

  public async salvarImagem(id: number, token: string, arquivo: string, imageData): Promise<boolean> {
    return this.writeFile(imageData, 'fotos', arquivo)
      .then(
        async (gravou) => {

          return this.professorApiService.postFoto(id, imageData, token)
          .then(
            ret => {
              console.log('Imagem enviada ', ret);
              return true;
            }
          )
          .catch(
            async (error: Error) => {
              return Promise.reject(error.message);
            }
          );

        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject(error.message);
        }
      );

  }

}
