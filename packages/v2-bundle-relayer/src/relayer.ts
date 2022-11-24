import pkg from '../package.json'

export class Relayer {
  get version () {
    return pkg.version
  }
}
