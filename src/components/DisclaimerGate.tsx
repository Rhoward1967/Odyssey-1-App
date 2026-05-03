import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

// Sovereign Disclaimer — all 12 supported languages
// US legal citations always remain in English per Linguistic Bridge rules.
const DISCLAIMER: Record<string, { title: string; body: string; accept: string; deny: string }> = {
  'en-US': {
    title: 'Administrative Research Tool — Important Notice',
    body: `This platform is an administrative research and document-drafting tool operated under the Howard Jones Bloodline Ancestral Trust (UCC 1-308 | Natural Law | Common Law first claim priority).

It does NOT constitute legal advice, legal representation, or a guarantee of any legal outcome. All outputs are for informational and administrative purposes only.

US legal citations (15 U.S.C. § 1681, UCC 1-308, etc.) are provided as reference anchors. You must consult qualified legal counsel before taking any legal action.

By clicking "I Acknowledge & Accept," you confirm you understand these terms and consent to use this tool in its intended administrative capacity.`,
    accept: 'I Acknowledge & Accept',
    deny: 'I Do Not Accept — Exit',
  },
  'es-US': {
    title: 'Herramienta de Investigación Administrativa — Aviso Importante',
    body: `Esta plataforma es una herramienta de investigación administrativa y redacción de documentos operada bajo el Howard Jones Bloodline Ancestral Trust (UCC 1-308 | Derecho Natural | Prioridad de primera reclamación de derecho consuetudinario).

NO constituye asesoramiento legal, representación legal ni garantía de ningún resultado legal. Todos los resultados son únicamente para fines informativos y administrativos.

Las citas legales de EE.UU. (15 U.S.C. § 1681, UCC 1-308, etc.) se proporcionan como referencias de anclaje. Debe consultar a un abogado calificado antes de tomar cualquier acción legal.

Al hacer clic en "Reconozco y Acepto," confirma que comprende estos términos y consiente en utilizar esta herramienta en su capacidad administrativa prevista.`,
    accept: 'Reconozco y Acepto',
    deny: 'No Acepto — Salir',
  },
  'zh-CN': {
    title: '行政研究工具 — 重要声明',
    body: `本平台是一款行政研究和文件起草工具，由Howard Jones Bloodline Ancestral Trust（UCC 1-308 | 自然法 | 普通法优先权主张）运营。

本平台不构成法律建议、法律代理或任何法律结果的保证。所有输出内容仅供信息和行政参考之用。

美国法律引文（15 U.S.C. § 1681、UCC 1-308等）作为参考锚点提供。在采取任何法律行动之前，您必须咨询具有资质的法律顾问。

点击"我知晓并接受"即表示您理解这些条款，并同意以预期的行政方式使用本工具。`,
    accept: '我知晓并接受',
    deny: '我不接受 — 退出',
  },
  'zh-TW': {
    title: '行政研究工具 — 重要聲明',
    body: `本平台是一款行政研究和文件起草工具，由Howard Jones Bloodline Ancestral Trust（UCC 1-308 | 自然法 | 普通法優先權主張）運營。

本平台不構成法律建議、法律代理或任何法律結果的保證。所有輸出內容僅供資訊和行政參考之用。

美國法律引文（15 U.S.C. § 1681、UCC 1-308等）作為參考錨點提供。在採取任何法律行動之前，您必須諮詢具有資質的法律顧問。

點擊「我知曉並接受」即表示您理解這些條款，並同意以預期的行政方式使用本工具。`,
    accept: '我知曉並接受',
    deny: '我不接受 — 退出',
  },
  'tl-US': {
    title: 'Administratibong Tool sa Pananaliksik — Mahalagang Paunawa',
    body: `Ang platform na ito ay isang administratibong tool sa pananaliksik at paggawa ng dokumento na pinapatakbo sa ilalim ng Howard Jones Bloodline Ancestral Trust (UCC 1-308 | Natural Law | Common Law na unang paghahabol ng priyoridad).

HINDI ito bumubuo ng legal na payo, legal na representasyon, o garantiya ng anumang legal na resulta. Ang lahat ng output ay para sa impormasyonal at administratibong layunin lamang.

Ang mga legal na sanggunian ng US (15 U.S.C. § 1681, UCC 1-308, atbp.) ay ibinibigay bilang mga sangguniang angkla. Dapat kang kumonsulta sa isang kwalipikadong abogado bago gumawa ng anumang legal na hakbang.

Sa pag-click ng "Kinikilala at Tinatanggap Ko," kinukumpirma mo na naiintindihan mo ang mga tuntuning ito at pumapayag na gamitin ang tool na ito sa nilalayon nitong administratibong kapasidad.`,
    accept: 'Kinikilala at Tinatanggap Ko',
    deny: 'Hindi Ko Tinatanggap — Lumabas',
  },
  'vi-US': {
    title: 'Công Cụ Nghiên Cứu Hành Chính — Thông Báo Quan Trọng',
    body: `Nền tảng này là công cụ nghiên cứu hành chính và soạn thảo tài liệu được vận hành dưới sự quản lý của Howard Jones Bloodline Ancestral Trust (UCC 1-308 | Luật Tự Nhiên | Ưu tiên khiếu nại đầu tiên theo Thông Luật).

Đây KHÔNG phải là tư vấn pháp lý, đại diện pháp lý, hoặc bảo đảm bất kỳ kết quả pháp lý nào. Tất cả đầu ra chỉ dành cho mục đích thông tin và hành chính.

Các trích dẫn pháp lý của Mỹ (15 U.S.C. § 1681, UCC 1-308, v.v.) được cung cấp làm neo tham chiếu. Bạn phải tham khảo ý kiến luật sư có chuyên môn trước khi thực hiện bất kỳ hành động pháp lý nào.

Bằng cách nhấp vào "Tôi Xác Nhận & Chấp Nhận," bạn xác nhận rằng bạn hiểu các điều khoản này và đồng ý sử dụng công cụ này theo năng lực hành chính dự kiến.`,
    accept: 'Tôi Xác Nhận & Chấp Nhận',
    deny: 'Tôi Không Chấp Nhận — Thoát',
  },
  'ar-US': {
    title: 'أداة البحث الإداري — إشعار مهم',
    body: `هذه المنصة أداة بحث إداري وصياغة وثائق تعمل تحت إدارة Howard Jones Bloodline Ancestral Trust (UCC 1-308 | القانون الطبيعي | أولوية المطالبة الأولى بموجب القانون العرفي).

لا تشكّل هذه المنصة مشورة قانونية أو تمثيلاً قانونياً أو ضماناً لأي نتيجة قانونية. جميع المخرجات لأغراض إعلامية وإدارية فحسب.

تُوفَّر الاستشهادات القانونية الأمريكية (15 U.S.C. § 1681, UCC 1-308, إلخ.) كمرجعيات محورية. يجب عليك استشارة محامٍ مؤهَّل قبل اتخاذ أي إجراء قانوني.

بالنقر على "أُقرّ وأقبل"، تؤكد فهمك لهذه الشروط وموافقتك على استخدام هذه الأداة في صفتها الإدارية المقصودة.`,
    accept: 'أُقرّ وأقبل',
    deny: 'لا أقبل — خروج',
  },
  'fr-US': {
    title: "Outil de Recherche Administrative — Avis Important",
    body: `Cette plateforme est un outil de recherche administrative et de rédaction de documents exploité sous le Howard Jones Bloodline Ancestral Trust (UCC 1-308 | Droit Naturel | Priorité de première revendication en droit coutumier).

Elle ne constitue PAS un conseil juridique, une représentation légale, ni une garantie de tout résultat juridique. Tous les résultats sont fournis à des fins d'information et d'administration uniquement.

Les citations juridiques américaines (15 U.S.C. § 1681, UCC 1-308, etc.) sont fournies à titre de références d'ancrage. Vous devez consulter un conseiller juridique qualifié avant d'entreprendre toute action légale.

En cliquant sur « Je Reconnais et J'Accepte », vous confirmez que vous comprenez ces conditions et consentez à utiliser cet outil dans sa capacité administrative prévue.`,
    accept: "Je Reconnais et J'Accepte",
    deny: "Je N'Accepte Pas — Quitter",
  },
  'ko-US': {
    title: '행정 연구 도구 — 중요 공지',
    body: `이 플랫폼은 Howard Jones Bloodline Ancestral Trust(UCC 1-308 | 자연법 | 보통법 우선 청구권)에 의해 운영되는 행정 연구 및 문서 작성 도구입니다.

이 플랫폼은 법적 조언, 법적 대리, 또는 어떠한 법적 결과에 대한 보증을 구성하지 않습니다. 모든 결과물은 정보 및 행정 목적으로만 제공됩니다.

미국 법률 인용(15 U.S.C. § 1681, UCC 1-308 등)은 참조 앵커로 제공됩니다. 법적 조치를 취하기 전에 자격을 갖춘 법률 고문과 상담해야 합니다.

"나는 인정하고 수락합니다"를 클릭함으로써 귀하는 이 조건을 이해하고 의도된 행정 역할로 이 도구를 사용하는 것에 동의함을 확인합니다.`,
    accept: '나는 인정하고 수락합니다',
    deny: '수락하지 않습니다 — 나가기',
  },
  'ru-US': {
    title: 'Административный Исследовательский Инструмент — Важное Уведомление',
    body: `Данная платформа является инструментом административных исследований и составления документов, действующим под управлением Howard Jones Bloodline Ancestral Trust (UCC 1-308 | Естественное право | Приоритетный иск общего права).

Она НЕ является юридической консультацией, юридическим представительством или гарантией какого-либо юридического результата. Все выходные данные предназначены исключительно для информационных и административных целей.

Ссылки на американское законодательство (15 U.S.C. § 1681, UCC 1-308 и др.) приводятся в качестве опорных ссылок. Перед принятием каких-либо юридических мер необходимо проконсультироваться с квалифицированным юридическим советником.

Нажимая «Я Подтверждаю и Принимаю», вы подтверждаете понимание настоящих условий и согласие на использование данного инструмента в предусмотренных административных целях.`,
    accept: 'Я Подтверждаю и Принимаю',
    deny: 'Я Не Принимаю — Выйти',
  },
  'hi-US': {
    title: 'प्रशासनिक अनुसंधान उपकरण — महत्वपूर्ण सूचना',
    body: `यह प्लेटफ़ॉर्म एक प्रशासनिक अनुसंधान और दस्तावेज़ तैयार करने का उपकरण है, जो Howard Jones Bloodline Ancestral Trust (UCC 1-308 | प्राकृतिक कानून | सामान्य कानून प्रथम दावा प्राथमिकता) के अंतर्गत संचालित है।

यह कानूनी सलाह, कानूनी प्रतिनिधित्व, या किसी कानूनी परिणाम की गारंटी नहीं है। सभी आउटपुट केवल सूचनात्मक और प्रशासनिक उद्देश्यों के लिए हैं।

अमेरिकी कानूनी उद्धरण (15 U.S.C. § 1681, UCC 1-308, आदि) संदर्भ एंकर के रूप में प्रदान किए जाते हैं। कोई भी कानूनी कार्रवाई करने से पहले आपको योग्य कानूनी परामर्शदाता से परामर्श करना चाहिए।

"मैं स्वीकार करता हूँ और सहमत हूँ" पर क्लिक करके, आप पुष्टि करते हैं कि आप इन शर्तों को समझते हैं और इस उपकरण को इसकी इच्छित प्रशासनिक क्षमता में उपयोग करने के लिए सहमत हैं।`,
    accept: 'मैं स्वीकार करता हूँ और सहमत हूँ',
    deny: 'मैं सहमत नहीं हूँ — बाहर निकलें',
  },
  'pt-US': {
    title: 'Ferramenta de Pesquisa Administrativa — Aviso Importante',
    body: `Esta plataforma é uma ferramenta de pesquisa administrativa e elaboração de documentos operada sob o Howard Jones Bloodline Ancestral Trust (UCC 1-308 | Direito Natural | Prioridade de primeira reivindicação do direito consuetudinário).

Ela NÃO constitui assessoria jurídica, representação legal ou garantia de qualquer resultado jurídico. Todos os resultados são fornecidos apenas para fins informativos e administrativos.

As citações jurídicas dos EUA (15 U.S.C. § 1681, UCC 1-308, etc.) são fornecidas como âncoras de referência. Você deve consultar um advogado qualificado antes de tomar qualquer medida legal.

Ao clicar em "Reconheço e Aceito," você confirma que entende estes termos e consente em utilizar esta ferramenta em sua capacidade administrativa pretendida.`,
    accept: 'Reconheço e Aceito',
    deny: 'Não Aceito — Sair',
  },
};

export default function DisclaimerGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'required' | 'accepted'>('loading');
  const [lang, setLang] = useState<string>('en-US');
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkDisclaimer();
  }, []);

  async function checkDisclaimer() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStatus('accepted'); return; }

    setUserId(user.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('legal_disclaimer_accepted, preferred_language')
      .eq('id', user.id)
      .single();

    if (profile?.legal_disclaimer_accepted) {
      setStatus('accepted');
    } else {
      setLang(profile?.preferred_language || 'en-US');
      setStatus('required');
    }
  }

  async function handleAccept() {
    if (!userId) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        legal_disclaimer_accepted: true,
        disclaimer_accepted_at: new Date().toISOString(),
      })
      .eq('id', userId);
    setStatus('accepted');
    setSaving(false);
  }

  function handleDeny() {
    supabase.auth.signOut();
    window.location.href = '/';
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (status === 'required') {
    const text = DISCLAIMER[lang] || DISCLAIMER['en-US'];
    const isRTL = lang === 'ar-US';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div
          className="bg-slate-900 border border-amber-500/40 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <h2 className="text-amber-400 font-bold text-lg leading-tight">
                {text.title}
              </h2>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono">
              Howard Jones Bloodline Ancestral Trust · UCC 1-308 · Natural Law
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {text.body}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 h-auto"
              onClick={handleAccept}
              disabled={saving}
            >
              {saving ? '...' : text.accept}
            </Button>
            <Button
              variant="outline"
              className="sm:w-auto border-slate-600 text-slate-400 hover:text-slate-200 py-3 h-auto"
              onClick={handleDeny}
            >
              {text.deny}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
