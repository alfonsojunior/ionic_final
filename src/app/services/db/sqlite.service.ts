import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private db: SQLiteObject;

  constructor(private platform: Platform, private sqlite: SQLite) { }

  private async createDatabase(dbName?: string): Promise<SQLiteObject> {
    return this.platform.ready()
      .then((ok) => {

        return this.sqlite.create({
          name: dbName || 'ionicFinal.db',
          location: 'default'
        }).then((db: SQLiteObject) => {
          this.db = db;
          return db;
        }).catch((error: Error) => {
          console.log('Erro ao abrir ou criar a database: ', error);
          return Promise.reject(error.message || error);
        });

      });
  }

  getDb(dbName?: string, newOpen?: boolean): Promise<SQLiteObject> {
    if (newOpen) { return this.createDatabase(dbName); }
    return this.db ? Promise.resolve(this.db) : this.createDatabase(dbName);
  }
}
