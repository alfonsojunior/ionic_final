import { ConfiguracaoService } from './../local/configuracao.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Professor } from '../../model/professor.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ProfessorApiService {

  private API_URL: string;
  private professores: Professor[] = [];

  constructor(
    private configuracaoService: ConfiguracaoService,
    private http: HttpClient
  ) { }

  async lista(token: string): Promise<Professor[]> {
    this.professores = [];
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'professor';
          return this.http.get(`${this.API_URL}/lista/${token}`)
            .toPromise()
            .then(
              (data: any) => {
                let professor: Professor = new Professor();
                for (let i = 0; i < data.length; i++) {
                  professor = new Professor();
                  professor.id = data[i].id;
                  professor.nome = data[i].nome;
                  professor.nascimento = data[i].nascimento;
                  professor.curriculo = data[i].curriculo;
                  professor.status = data[i].status;
                  professor.enviado = 'S';
                  this.professores.push(professor);
                }
                return this.professores;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                if (error.status === 401) {
                  return Promise.reject('Erro de autenticação');
                } else {
                  return Promise.reject((error.message || error));
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

  async getProfessor(id: number, token: string): Promise<Professor> {
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'professor';
          return this.http.get(`${this.API_URL}/${id}/${token}`)
            .toPromise()
            .then(
              (data: any) => {
                const professor: Professor = new Professor();
                professor.id = id;
                professor.nome = data.nome;
                professor.nascimento = data.nascimento;
                professor.curriculo = data.curriculo;
                professor.status = data.status;
                professor.enviado = 'S';
                return professor;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                switch (error.status) {
                  case 401:
                    return Promise.reject('Erro de autenticação');
                    break;
                  case 404:
                    return Promise.reject('Professor não encontrado');
                    break;
                  default:
                    return Promise.reject((error.message || error));
                    break;
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

  public async postProfessor(professor: Professor, token: string): Promise<Professor> {
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'professor';
          professor.id = professor.externalId;
          const body = JSON.stringify(professor);
          return this.http.post(`${this.API_URL}/novo/${token}`, body, httpOptions)
            .toPromise()
            .then(
              (prof: Professor) => {
                return prof;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                switch (error.status) {
                  case 400:
                    return Promise.reject('Requisição inválida');
                    break;
                  case 401:
                    return Promise.reject('Erro de autenticação');
                    break;
                  default:
                    return Promise.reject(error.message || error);
                    break;
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

  public async deleteProfessor(id: number, token: string): Promise<boolean> {
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'professor';
          return this.http.delete(`${this.API_URL}/eliminar/${id}/${token}`)
            .toPromise()
            .then(
              (professor: Professor) => {
                console.log(`Professor ${professor.nome} eliminado com sucesso`);
                return true;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                switch (error.status) {
                  case 404:
                    return Promise.reject('Professor não encontrado');
                    break;
                  case 401:
                    return Promise.reject('Erro de autenticação');
                    break;
                  default:
                    return Promise.reject(error.message || error);
                    break;
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

  public async getFoto(id: number, token: string): Promise<string> {
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          this.API_URL = url + 'professor';
          return this.http.get(`${this.API_URL}/foto/${id}/${token}`)
            .toPromise()
            .then(
              (data: any) => {
                return data.foto;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                switch (error.status) {
                  case 404:
                    return Promise.reject('Foto não encontrada');
                    break;
                  case 401:
                    return Promise.reject('Erro de autenticação');
                    break;
                  default:
                    return Promise.reject(error.message || error);
                    break;
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

  public async postFoto(id: number, foto: string, token: string): Promise<boolean> {
    return this.configuracaoService.getApiURL()
      .then(
        async (url) => {
          // let block = foto.split(';');
          // foto = block[block.length - 1];
          // block = foto.split(',');
          // foto = block[block.length - 1];
          this.API_URL = url + 'professor';
          const body = JSON.stringify({id: id, foto: foto});
          return this.http.post(`${this.API_URL}/foto/novo/${token}`, body, httpOptions)
            .toPromise()
            .then(
              (data) => {
                // console.log(data);
                return true;
              }
            )
            .catch(
              (error: HttpErrorResponse) => {
                switch (error.status) {
                  case 400:
                    return Promise.reject('Requisição inválida');
                    break;
                  case 401:
                    return Promise.reject('Erro de autenticação');
                    break;
                  default:
                    return Promise.reject(error.message || error);
                    break;
                }
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('A URL da API não foi configurada');
        }
      );
  }

}
