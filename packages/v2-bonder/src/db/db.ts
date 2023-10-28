import { ExitableBundlesDb } from './exitableBundlesDb/ExitableBundlesDb'
import { TxStateDb } from './txStateDb/TxStateDb'
import { dbPath as _configDbPath } from '../config'

let configDbPath = _configDbPath
const instances: Record<string, any | TxStateDb | ExitableBundlesDb> = {}

function getDb (DbClass: any) {
  const dbName = DbClass.name
  if (instances[dbName]) {
    return instances[dbName]
  }

  const db = new DbClass(configDbPath)
  instances[dbName] = db
  return db
}

export const db = {
  setDbPath (dbPath: string) {
    if (Object.keys(instances).length > 0) {
      throw new Error('dbPath can only be set before any db instance is created')
    }
    configDbPath = dbPath
  },
  get txStateDb (): TxStateDb {
    return getDb(TxStateDb)
  },
  get exitableBundlesDb (): ExitableBundlesDb {
    const _db = getDb(ExitableBundlesDb)
    if (!_db.otherDbs) {
      _db.otherDbs = db
    }
    return _db
  }
}
