import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Search } from 'lucide-react';

const DynamicFAQ = () => {
  const { t } = useTranslation('support');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [helpfulAnswers, setHelpfulAnswers] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: t('faq.categories.booking'),
      questions: [
        { id: 1, question: t('faq.questions.modifyBooking'), answer: t('faq.questions.modifyBookingAnswer') },
        { id: 2, question: t('faq.questions.paymentMethods'), answer: t('faq.questions.paymentMethodsAnswer') },
      ],
    },
    {
      category: t('faq.categories.aiFeatures'),
      questions: [
        { id: 3, question: t('faq.questions.aiPlanner'), answer: t('faq.questions.aiPlannerAnswer') },
        { id: 4, question: t('faq.questions.customizeAI'), answer: t('faq.questions.customizeAIAnswer') },
      ],
    },
  ];

  const filteredFaqs = faqs
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
             q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(cat => cat.questions.length > 0);

  return (
    <div className="space-y-8">
      <div className="relative">
        <input
          type="text"
          placeholder={t('faq.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {filteredFaqs.map((category, ci) => (
        <div key={ci}>
          <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
          <div className="space-y-4">
            {category.questions.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenQuestion(openQuestion === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openQuestion === faq.id
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openQuestion === faq.id && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-600 mb-4">{faq.answer}</p>
                      {helpfulAnswers[faq.id] === undefined ? (
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{t('faq.feedback.question')}</span>
                          <button onClick={() => setHelpfulAnswers({ ...helpfulAnswers, [faq.id]: true })} className="flex items-center gap-1 hover:text-green-500 transition-colors">
                            <ThumbsUp className="w-4 h-4" />{t('faq.feedback.yes')}
                          </button>
                          <button onClick={() => setHelpfulAnswers({ ...helpfulAnswers, [faq.id]: false })} className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <ThumbsDown className="w-4 h-4" />{t('faq.feedback.no')}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t('faq.feedback.thanks')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredFaqs.length === 0 && (
        <div className="text-center py-8 text-gray-500">{t('search.noResults')}</div>
      )}
    </div>
  );
};

export default DynamicFAQ;
