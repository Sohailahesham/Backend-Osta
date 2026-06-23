import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroqProvider } from 'src/ai/providers/groq.provider';
import {
  Technician,
  TechnicianDocument,
} from 'src/technician/schemas/technician.schema';
import {
  MainRequest,
  RequestDocument,
} from 'src/request/schemas/request.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { RequestStatus } from 'src/request/enums/request-status.enum';

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

const conversationStore = new Map<string, ConversationTurn[]>();

// ─── Category-aware FAQ chips ──────────────────────────────────────────────────
const CATEGORY_CHIPS: Record<string, string[]> = {
  default: [
    'ما جدولي اليوم؟',
    'هل عندي طلبات الغد؟',
  ],
  كهرباء: [
    'ما جدولي اليوم؟',
    'هل عندي طلبات الغد؟',
    'ما معنى خطأ E5 على لوحة الكهرباء؟',
    'كيف أفحص القاطع الكهربائي؟',
    'أسباب انقطاع التيار المتكرر في شقة؟',
    'كيف أوصل مفتاح ثنائي الاتجاه؟',
  ],
  سباكة: [
    'ما جدولي اليوم؟',
    'هل عندي طلبات الغد؟',
    'كيف أكشف تسريب مياه خفي في الحوائط؟',
    'أسباب انخفاض ضغط الماء فجأة؟',
    'كيف أصلح صنبور يقطر باستمرار؟',
    'كيف أفحص مضخة المياه؟',
  ],
  تكييف: [
    'ما جدولي اليوم؟',
    'هل عندي طلبات الغد؟',
    'ما معنى رمز الخطأ E1 على مكيف كاريير؟',
    'كيف أنظف فلتر المكيف بشكل صحيح؟',
    'أسباب تسريب الماء من الوحدة الداخلية؟',
    'المكيف يبرد ثم يتوقف فجأة — ما السبب؟',
  ],
  نجارة: [
    'ما جدولي اليوم؟',
    'هل عندي طلبات الغد؟',
    'كيف أصلح باب خشبي منتفخ لا يُغلق؟',
    'أفضل طريقة لإصلاح درج مكسور؟',
    'كيف أثبت رف حائطي بشكل آمن؟',
    'كيف أتعامل مع خشب تشقق بسبب الرطوبة؟',
  ],
  'إصلاح أجهزة': [
    'ما جدولي اليوم؟',
    'هل عندي طلبات الغد؟',
    'الغسالة لا تدور — كيف أفحص المحرك؟',
    'الثلاجة لا تبرد بكفاءة — ما الأسباب؟',
    'كيف أفحص سخان الماء الكهربائي؟',
    'الفرن لا يُسخن — ما الفحوصات الأولية؟',
  ],
};

// ─── Guardrails ───────────────────────────────────────────────────────────────
const BLOCKED_KEYWORDS = [
  'سياسة', 'حكومة', 'دين', 'أخبار', 'رياضة', 'أغنية', 'فيلم',
  'طبخ', 'وصفة', 'سفر', 'سياحة', 'استثمار', 'بورصة', 'عملة',
  'قانون', 'طب', 'علاج', 'دواء', 'محامي', 'شعر', 'قصيدة',
];

const ALLOWED_DOMAINS = [
  'كهرباء', 'سباكة', 'تكييف', 'نجارة', 'أجهزة', 'جدول', 'مواعيد',
  'طلبات', 'عمل', 'فحص', 'خطأ', 'عطل', 'إصلاح', 'تركيب', 'صيانة',
  'توصيل', 'كابل', 'سلك', 'ماء', 'ضغط', 'تسريب', 'مضخة', 'فلتر',
  'برودة', 'حرارة', 'باب', 'نافذة', 'خشب', 'غسالة', 'ثلاجة', 'فرن',
  'سخان', 'موتور', 'محرك', 'قاطع', 'لوحة', 'أسلاك', 'منزل',
];

@Injectable()
export class TechCompanionService {
  constructor(
    private readonly groq: GroqProvider,
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<TechnicianDocument>,
    @InjectModel(MainRequest.name)
    private readonly requestModel: Model<RequestDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async process(message: string, technicianUserId: string, conversationId?: string) {
    const convId = conversationId ?? `tech_${technicianUserId}_${Date.now()}`;

    if (!conversationStore.has(convId)) {
      conversationStore.set(convId, []);
    }
    const history = conversationStore.get(convId)!;

    // ── Guardrails check ──
    if (this.isOutOfScope(message)) {
      return {
        conversationId: convId,
        outOfScope: true,
        message: null,
      };
    }

    // ── Schedule query detection ──
    const isScheduleQuery = this.detectScheduleQuery(message);
    let contextData = '';
    if (isScheduleQuery) {
      contextData = await this.fetchTechnicianContext(technicianUserId);
    }

    // ── Build system prompt ──
    const systemPrompt = await this.buildSystemPrompt(technicianUserId, contextData);

    // ── Build messages array for Groq ──
    // groq.ask(prompt, history) → sends [...history, {role:'user', content:prompt}]
    // So we use systemPrompt as the first history item (role:'user') + prior turns,
    // and pass current message as prompt
    const groqHistory: ConversationTurn[] = [
      { role: 'user', content: systemPrompt },
      { role: 'assistant', content: 'مفهوم، أنا جاهز للمساعدة.' },
      ...history.slice(-10),
    ];

    const aiReply = await this.groq.ask(message, groqHistory);

    // ── Save turns ──
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: aiReply });

    if (history.length > 20) {
      conversationStore.set(convId, history.slice(-20));
    }

    return {
      conversationId: convId,
      outOfScope: false,
      message: aiReply,
    };
  }

  // ── Fetch chips for the technician's category ──────────────────────────────
  async getChips(technicianUserId: string): Promise<string[]> {
    try {
      const techProfile = await this.technicianModel
        .findOne({ userId: new Types.ObjectId(technicianUserId) })
        .populate('specialization.categoryId', 'name')
        .lean();
      const catName: string = (techProfile?.specialization?.categoryId as any)?.name ?? '';
      return this.chipsForCategory(catName);
    } catch {
      return CATEGORY_CHIPS.default;
    }
  }

  chipsForCategory(categoryName: string): string[] {
    const key = Object.keys(CATEGORY_CHIPS).find(
      (k) => k !== 'default' && categoryName.includes(k),
    );
    return CATEGORY_CHIPS[key ?? 'default'];
  }

  // ─────────────────────────────────────────────────────────────────────────────

  private isOutOfScope(message: string): boolean {
    const lower = message.toLowerCase();
    const hasBlocked = BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
    if (!hasBlocked) return false;
    // If it also contains a technical domain word, allow it
    const hasDomain = ALLOWED_DOMAINS.some((kw) => lower.includes(kw));
    return !hasDomain;
  }

  private detectScheduleQuery(message: string): boolean {
    const keywords = [
      'جدول', 'مواعيد', 'طلبات', 'اليوم', 'غداً', 'غدا',
      'الأسبوع', 'شغل', 'عمل', 'كم', 'عندي', 'طلب', 'موعد', 'سفر', 'خارج',
    ];
    const lower = message.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  }

  private async fetchTechnicianContext(technicianUserId: string): Promise<string> {
    try {
      const userObjectId = new Types.ObjectId(technicianUserId);

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const tomorrowEnd   = new Date(todayEnd);   tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

      const activeStatuses = [
        RequestStatus.ACCEPTED,
        RequestStatus.IN_PROGRESS,
        RequestStatus.ON_THE_WAY,
        RequestStatus.STARTED,
      ];

      const [todayRequests, tomorrowRequests, techProfile] = await Promise.all([
        this.requestModel
          .find({ assignedTechnician: userObjectId, status: { $in: activeStatuses }, preferredDate: { $gte: todayStart, $lte: todayEnd } })
          .populate('userId', 'fullName phone')
          .populate('categoryId', 'name')
          .populate('serviceId', 'name')
          .lean(),
        this.requestModel
          .find({ assignedTechnician: userObjectId, status: { $in: activeStatuses }, preferredDate: { $gte: tomorrowStart, $lte: tomorrowEnd } })
          .populate('userId', 'fullName phone')
          .populate('categoryId', 'name')
          .populate('serviceId', 'name')
          .lean(),
        this.technicianModel
          .findOne({ userId: userObjectId })
          .populate('specialization.categoryId', 'name')
          .lean(),
      ]);

      const fmt = (reqs: any[]) => {
        if (!reqs.length) return 'لا توجد طلبات.';
        return reqs.map((r, i) => {
          const client   = (r.userId as any)?.fullName ?? 'غير معروف';
          const phone    = (r.userId as any)?.phone ?? 'غير متاح';
          const service  = (r.serviceId as any)?.name ?? 'خدمة';
          const district = r.address?.district ?? '';
          const time     = r.preferredTime ?? '';
          const isOutOfCity = r.address?.fullAddress?.toLowerCase().includes('خارج') ?? false;
          return `  ${i + 1}. ${client} | ${phone} | ${service} | ${time} | ${district}${isOutOfCity ? ' [خارج المدينة]' : ''}`;
        }).join('\n');
      };

      return `
[بيانات جدول الفني - ${new Date().toLocaleDateString('ar-EG')}]
اليوم (${todayRequests.length} طلب):
${fmt(todayRequests)}
الغد (${tomorrowRequests.length} طلب):
${fmt(tomorrowRequests)}
`.trim();
    } catch (err) {
      console.error('[TechCompanion] context fetch error:', err);
      return '';
    }
  }

  private async buildSystemPrompt(technicianUserId: string, contextData: string): Promise<string> {
    let specialization = 'الصيانة المنزلية العامة';
    try {
      const techProfile = await this.technicianModel
        .findOne({ userId: new Types.ObjectId(technicianUserId) })
        .populate('specialization.categoryId', 'name')
        .lean();
      const name = (techProfile?.specialization?.categoryId as any)?.name;
      if (name) specialization = name;
    } catch (_) {}

    return `أنت "TechCompanion" — المساعد الذكي الشخصي للفنيين في منصة أوسطى.
تخصص هذا الفني: ${specialization}.

مهامك الوحيدة:
1. الإجابة على الأسئلة التقنية المتعلقة بـ ${specialization} فقط (رموز أخطاء، خطوات إصلاح، تشخيص أعطال، مخططات توصيل).
2. تقديم معلومات جدول الفني ومواعيده من البيانات المتوفرة أدناه.

قواعد صارمة:
- إذا كان السؤال خارج تخصص ${specialization} أو خارج الجدول، قل: "هذا خارج نطاق تخصصي".
- لا تناقش السياسة أو الدين أو الطب أو الأخبار أو أي موضوع غير تقني.
- الرد بالعربية دائماً، موجز وعملي.
- للأسئلة التقنية: السبب أولاً، ثم خطوات الحل بالترتيب.
- للجدول: ملخص سريع بالأرقام والتفاصيل الأساسية فقط.

${contextData ? contextData : ''}`;
  }
}