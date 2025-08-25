import React from 'react';
import { Briefcase, Compass, Sparkles } from 'lucide-react';
import type { UserType } from '@/services/profile/types';

interface UserTypeSelectorProps {
  selectedType: UserType | null;
  onSelect: (type: UserType) => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedType,
  onSelect,
}) => {
  const userTypes = [
    {
      type: 'business' as const,
      icon: Briefcase,
      title: 'Business Traveler',
      description: 'Optimize for work trips with expense tracking and meeting integration',
    },
    {
      type: 'leisure' as const,
      icon: Compass,
      title: 'Leisure Explorer',
      description: 'Discover unique experiences and authentic adventures',
    },
    {
      type: 'bleisure' as const,
      icon: Sparkles,
      title: 'Bleisure Enthusiast',
      description: 'Balance work and leisure with flexible planning tools',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {userTypes.map(({ type, icon: Icon, title, description }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`p-6 rounded-xl text-left transition-all ${
            selectedType === type
              ? 'bg-orange-50 border-2 border-orange-500'
              : 'bg-white border-2 border-transparent hover:border-orange-200'
          }`}
        >
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
            selectedType === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </button>
      ))}
    </div>
  );
};

export default UserTypeSelector;