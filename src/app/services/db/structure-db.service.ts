import { Platform } from '@ionic/angular';
import { ConfiguracaoService } from './../local/configuracao.service';
import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class StructureDbService {

  private dbVersion = 0;
  private db: SQLiteObject;

  constructor(
      private configuracaoService: ConfiguracaoService,
      private platform: Platform,
      private sqliteService: SqliteService
  ) {

    this.platform.ready()
      .then(
        (ok) => {
          this.configuracaoService.getDbVersion()
            .then(
              versao => {
                this.dbVersion = versao;
              }
            );
        }
      );

  }

  private setVersion(versao: number) {
    this.configuracaoService.setDbVersion(versao);
  }

  createDatabase() {
    this.sqliteService.getDb()
      .then(
        (db: SQLiteObject) => {
          console.log(this.dbVersion);
          let sql = '';
          if (this.dbVersion < 1) {
            this.db = db;
            sql = 'CREATE TABLE IF NOT EXISTS professor (';
            sql += 'id INTEGER PRIMARY KEY AUTOINCREMENT, ';
            sql += 'nome VARCHAR(100), ';
            sql += 'nascimento VARCHAR(20), ';
            sql += 'curriculo TEXT, ';
            sql += 'status VARCHAR(10), ';
            sql += 'enviado VARCHAR(1), ';
            sql += 'externalId INTEGER';
            sql += ')';

            this.db.executeSql(sql, [])
            .then((success) => {
              // console.log(sql, success);
              this.dbVersion = 1;
              this.setVersion(this.dbVersion);
            })
            .catch((error: Error) => {
              console.log('ERR CRT PROFESSOR: ', error.message);
              console.log(error);
            });
          }
        }
      );
  }

  getDbVersion() {
    console.log(this.dbVersion);
  }
}
