export class DocParseError extends SyntaxError {
  public name = 'DocParseError';
  public messages: string[];

  public constructor(messages: string[]) {
    super();
    this.messages = messages;
    this.message = `The document failed to be parsed. (${messages.length} errors)`;
    Error.captureStackTrace(this, this.constructor);
  }
}
