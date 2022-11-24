import pkg from '../package.json'

export class Hop {
  get version () {
    return pkg.version
  }
}
