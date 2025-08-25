import React from 'react';
import { Phone, Globe, Clock, AlertCircle, CreditCard, Plug, Languages as Language } from 'lucide-react';

interface PracticalInfoProps {
  destination: string;
}

const PracticalInfo: React.FC<PracticalInfoProps> = ({ destination }) => {
  const info = {
    emergency: {
      police: '112',
      ambulance: '112',
      embassy: '+33 1 43 12 22 22'
    },
    general: {
      timezone: 'UTC+1',
      currency: 'Euro (€)',
      language: 'French',
      electricity: '230V, Type C & E'
    },
    customs: [
      'Tipping is not mandatory but appreciated (5-10%)',
      'Greeting with "Bonjour" is expected',
      'Many shops close on Sundays'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="font-medium">Emergency Numbers</div>
              <div className="text-sm text-gray-600">
                Police: {info.emergency.police}<br />
                Ambulance: {info.emergency.ambulance}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="font-medium">Embassy</div>
              <div className="text-sm text-gray-600">{info.emergency.embassy}</div>
            </div>
          </div>
        </div>
      </div>

      {/* General Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Timezone</div>
              <div className="font-medium">{info.general.timezone}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Currency</div>
              <div className="font-medium">{info.general.currency}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Language className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Language</div>
              <div className="font-medium">{info.general.language}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Plug className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Electricity</div>
              <div className="font-medium">{info.general.electricity}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Customs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Local Customs</h2>
        <div className="space-y-3">
          {info.customs.map((custom, index) => (
            <div key={index} className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600">{custom}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticalInfo;