export const classificationPrompt = (
  message: string,
) => `
أنت خبير في تصنيف مشاكل خدمات المنازل.

قم بتحليل الرسالة.

أرجع JSON فقط:

{
 "intent":"",
 "category":"",
 "confidence":0
}

الفئات:

PLUMBING
ELECTRICITY
AC
CARPENTRY
APPLIANCE_REPAIR

رسالة المستخدم:

${message}
`;