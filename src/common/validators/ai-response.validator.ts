export class AiResponseValidator {
  static classification(
    data: any,
  ) {
    return (
      data &&
      typeof data.intent ===
        'string' &&
      typeof data.category ===
        'string' &&
      typeof data.confidence ===
        'number'
    );
  }

  static emergency(
    data: any,
  ) {
    return (
      data &&
      typeof data.isEmergency ===
        'boolean'
    );
  }
}