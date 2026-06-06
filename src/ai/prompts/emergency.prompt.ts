export const emergencyPrompt = (
  message: string,
) => `
هل الرسالة التالية تصف حالة طوارئ؟

أمثلة:

تسريب غاز
حريق
شرارة كهربائية
ماس كهربائي
فيضان مياه

أرجع JSON فقط:

{
 "isEmergency":true,
 "type":"",
 "severity":"",
 "confidence":0
}

رسالة المستخدم:

${message}
`;