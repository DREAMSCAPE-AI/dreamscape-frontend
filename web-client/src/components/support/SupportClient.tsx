import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MessageCircle, Clock, CheckCircle, Send, ChevronDown } from 'lucide-react';

interface Channel { title: string; desc: string; detail: string; badge: string }
interface ResponseTime { value: string; label: string }

const channelIcons = [MessageCircle, Mail, Phone];
const channelColors = ['bg-orange-50 text-orange-500', 'bg-blue-50 text-blue-500', 'bg-purple-50 text-purple-500'];
const badgeColors = ['bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700'];

export default function SupportClient() {
  const { t } = useTranslation('support');
  const [subject, setSubject] = useState('');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const channels = t('contact.channels', { returnObjects: true }) as Channel[];
  const subjects = t('contact.subjects', { returnObjects: true }) as string[];
  const responseTimes = t('contact.responseTimes', { returnObjects: true }) as ResponseTime[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('contact.channelsTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {channels.map((c, i) => {
            const Icon = channelIcons[i];
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${channelColors[i]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColors[i]}`}>{c.badge}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{c.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{c.desc}</p>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />{c.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{t('contact.formTitle')}</h2>
        <p className="text-sm text-gray-500 mb-6">{t('contact.formSubtitle')}</p>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <p className="font-semibold text-gray-900">{t('contact.successTitle')}</p>
            <p className="text-sm text-gray-500 max-w-xs">{t('contact.successText')}</p>
            <button
              onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); setSubject(''); }}
              className="mt-2 text-sm text-orange-500 hover:underline"
            >
              {t('contact.sendAnother')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.nameLabel')}</label>
                <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('contact.namePlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.emailLabel')}</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('contact.emailPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.subjectLabel')}</label>
              <div className="relative">
                <button type="button" onClick={() => setSubjectOpen(!subjectOpen)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all">
                  <span className={subject ? 'text-gray-900' : 'text-gray-400'}>{subject || t('contact.subjectPlaceholder')}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {subjectOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    {subjects.map((s) => (
                      <button key={s} type="button" onClick={() => { setSubject(s); setSubjectOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.messageLabel')}</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={t('contact.messagePlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all" />
            </div>

            <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all">
              <Send className="w-4 h-4" />{t('contact.submitButton')}
            </button>
          </form>
        )}
      </div>

      <div className="bg-orange-50 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{t('contact.responseTitle')}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('contact.responseSubtitle')}</p>
        </div>
        <div className="flex gap-6 text-center text-sm">
          {responseTimes.map((rt, i) => (
            <div key={i}>
              <p className="font-bold text-orange-600">{rt.value}</p>
              <p className="text-xs text-gray-500">{rt.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
