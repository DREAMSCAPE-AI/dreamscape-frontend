import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Search } from 'lucide-react';

const DynamicFAQ = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [helpfulAnswers, setHelpfulAnswers] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Booking & Reservations',
      questions: [
        {
          id: 1,
          question: 'How do I modify or cancel my booking?',
          answer: 'You can modify or cancel your booking through your account dashboard. Go to "My Trips" and select the booking you wish to change. Please note that cancellation policies vary depending on the type of booking and how far in advance you cancel.'
        },
        {
          id: 2,
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment methods depending on your region. All payments are processed securely through our payment partners.'
        }
      ]
    },
    {
      category: 'Using AI Features',
      questions: [
        {
          id: 3,
          question: 'How does the AI trip planner work?',
          answer: 'Our AI trip planner analyzes your preferences, travel history, and current trends to create personalized itineraries. It considers factors like weather, local events, and your interests to suggest the best experiences for you.'
        },
        {
          id: 4,
          question: 'Can I customize AI recommendations?',
          answer: 'Yes! You can fine-tune AI recommendations by adjusting your preferences in your profile settings. You can also modify suggested itineraries directly and the AI will learn from your changes for future recommendations.'
        }
      ]
    }
  ];

  const handleFeedback = (questionId: number, isHelpful: boolean) => {
    setHelpfulAnswers({ ...helpfulAnswers, [questionId]: isHelpful });
    // Here you could also send analytics or store the feedback
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {filteredFaqs.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
          <div className="space-y-4">
            {category.questions.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenQuestion(openQuestion === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openQuestion === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {openQuestion === faq.id && (
                  <div className="px-6 pb-6 animate-fadeIn">
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-600 mb-4">{faq.answer}</p>
                      
                      {helpfulAnswers[faq.id] === undefined && (
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Was this answer helpful?</span>
                          <button
                            onClick={() => handleFeedback(faq.id, true)}
                            className="flex items-center gap-1 hover:text-green-500 transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Yes
                          </button>
                          <button
                            onClick={() => handleFeedback(faq.id, false)}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            No
                          </button>
                        </div>
                      )}
                      
                      {helpfulAnswers[faq.id] !== undefined && (
                        <div className="text-sm text-gray-500">
                          Thank you for your feedback!
                        </div>
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
        <div className="text-center py-8 text-gray-500">
          No FAQ matches your search. Try different keywords or browse all questions.
        </div>
      )}
    </div>
  );
};

export default DynamicFAQ;