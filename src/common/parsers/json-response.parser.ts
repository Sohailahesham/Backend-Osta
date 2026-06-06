export class JsonResponseParser {
  static parse(content: string) {
    try {
      const start =
        content.indexOf('{');

      const end =
        content.lastIndexOf('}') + 1;

      const json =
        content.slice(
          start,
          end,
        );

      return JSON.parse(json);
    } catch {
      throw new Error(
        'Invalid AI JSON',
      );
    }
  }
}