export class AppLogger {
  static log(...messages: unknown[]) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(...messages);
    }
  }
  static warn(...messages: unknown[]) {
    if (process.env.NODE_ENV === 'dev') {
      console.warn(...messages);
    }
  }
  static error(...messages: unknown[]) {
    if (process.env.NODE_ENV === 'dev') {
      console.error(...messages);
    }
  }
}
