export const responsePrompt =
  (
    issue: string,
    service: string,
  ) => `
أنت مساعد خدمات منزلية.

اشرح للمستخدم بالعربية لماذا هذه الخدمة مناسبة.

المشكلة:
${issue}

الخدمة:
${service}

أعد نصاً قصيراً فقط.
`;