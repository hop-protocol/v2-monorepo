
export class Controller {
  async getQuote (input: any) {
    const { chainSlug } = input

    return {
      chainSlug
    }
  }
}
