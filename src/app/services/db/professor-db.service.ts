import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SqliteService } from './sqlite.service';
import { Injectable } from '@angular/core';
import { Professor } from '../../model/professor.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessorDbService {

  public currentProfessor: Professor;

  constructor(
    private sqliteService: SqliteService
  ) { }

  async getAll(): Promise<Professor[]> {
    return this.sqliteService.getDb()
      .then(
        (db: SQLiteObject) => {
          const sql = 'SELECT * FROM professor';
          return <Promise<Professor[]>>db.executeSql(sql, [])
            .then(
              (resultSet) => {

                const lista: Professor[] = [];
                for (let i = 0; i < resultSet.rows.length; i++) {
                  lista.push(resultSet.rows.item(i));
                }

                return lista;
              }
            )
            .catch(
              (error: Error) => {
                return Promise.reject('PRF ALL ' + error.message || error);
              }
            );
        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('Erro ao carregar a database');
        }
      );
  }

  async getRegistros(ultimo: number, numero: number): Promise<Professor[]> {
    return this.sqliteService.getDb()
      .then(
        (db: SQLiteObject) => {
          const sql = 'SELECT * FROM professor WHERE id > ? LIMIT ?';
          return <Promise<Professor[]>>db.executeSql(sql, [ultimo, numero])
            .then(
              (resultSet) => {

                const lista: Professor[] = [];
                for (let i = 0; i < resultSet.rows.length; i++) {
                  lista.push(resultSet.rows.item(i));
                }

                return lista;
            })
            .catch((error: Error) => {
              return Promise.reject('PRF REG ' + error.message || error);
            });

      })
      .catch(
        (error: Error) => {
          return Promise.reject('Erro ao carregar a database');
        }
      );
  }

  private async create(professor: Professor): Promise<Professor> {
    return this.sqliteService.getDb()
      .then(
        async (db: SQLiteObject) => {
          const sql = 'INSERT INTO professor (nome, nascimento, curriculo, status, externalId) values(?, ?, ?, ?, ?)';
          return db.executeSql(sql, [
              professor.nome,
              professor.nascimento,
              professor.curriculo,
              professor.status,
              professor.externalId
            ])
            .then(
              (resultSet) => {
                console.log('Result INSERT ', resultSet);
                professor.id = resultSet.insertId;
                return professor;
              })
            .catch(
              (error: Error) => {
                return Promise.reject('PRF CRT ' + error.message);
              });
      })
      .catch(
        (error: Error) => {
          return Promise.reject('Erro ao carregar a database');
        }
      );
  }

  private async update(professor: Professor): Promise<Professor> {
    return this.sqliteService.getDb()
      .then(
        async (db: SQLiteObject) => {
          const sql = 'UPDATE professor SET nome = ?, nascimento = ?, curriculo = ?, status = ?, externalId = ? WHERE id = ?';
          return db.executeSql(sql, [
              professor.nome,
              professor.nascimento,
              professor.curriculo,
              professor.status,
              professor.externalId,
              professor.id
            ])
            .then(
              (resultSet) => {
                return professor;
              })
            .catch(
              (error: Error) => {
                return Promise.reject('PRF UPD ' + error.message);
              });
      })
      .catch(
        (error: Error) => {
          return Promise.reject('Erro ao carregar a database');
        }
      );
  }

  async getById(id: number): Promise<Professor> {
    return this.sqliteService.getDb()
      .then(
        (db: SQLiteObject) => {

          const sql = 'SELECT * FROM professor WHERE id = ?';
          return <Promise<Professor>>db.executeSql(sql, [id])
            .then(
              (resultSet) => {
                if (resultSet.rows.length > 0) {
                  return resultSet.rows.item(0);
                } else {
                  return new Professor();
                }
              })
            .catch(
              (error: Error) => {
                return Promise.reject('PRF GET ' + error.message);
              });

        })
      .catch(
        (error: Error) => {
          return Promise.reject('Erro ao carregar a database');
        });
  }

  async getProfessorSearch(filtro: string): Promise<Professor[]> {
    return this.sqliteService.getDb()
      .then(
        (db: SQLiteObject) => {

          filtro = '%' + filtro + '%';
          const sql = 'SELECT * FROM professor WHERE nome like ?';
          return db.executeSql(sql, [filtro])
            .then(
              (resultSet) => {

                const lista: Professor[] = [];
                for (let i = 0; i < resultSet.rows.length; i++) {
                  lista.push(resultSet.rows.item(i));
                }

                return lista;
              }
            )
            .catch(
              (error: Error) => {
                return Promise.reject(error.message);
              }
            );

        }
      )
      .catch(
        (error: Error) => {
          return Promise.reject('Erro ao carregar a database');
        }
      );
  }

  async salvar(professor: Professor): Promise<Professor> {
    return this.getById(professor.id)
      .then(
        (prof: Professor) => {
          if (prof !== null && prof !== undefined) {
            if (prof.id === undefined) {
              return this.create(professor);
            } else {
              if (prof.id > 0) {
                return this.update(professor);
              } else {
                return this.create(professor);
              }
            }
          } else {
            return this.update(professor);
          }
        })
      .catch((error: Error) => {
        // console.log(`Erro ao inserir o professor ${professor.id}`, error);
        // error.message = professor.id + ';' + error.message;
        return Promise.reject(error.message);
      });
  }

  async delete(id: number): Promise<boolean> {
    return this.sqliteService.getDb()
      .then(
        async (db: SQLiteObject) => {
          const sql = 'DELETE FROM professor WHERE id = ?';
          return db.executeSql(sql, [ id ])
            .then((resultSet) => {
              return resultSet.rowsAffected > 0;
            })
            .catch((error: Error) => {
              return Promise.reject(error.message);
            });
        }
      );
  }

}
