import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Shield, X, Mail, Crown } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  email: string;
}

interface TripCollaboratorsProps {
  collaborators: Collaborator[];
}

const TripCollaborators: React.FC<TripCollaboratorsProps> = ({ collaborators: initialCollaborators }) => {
  const { t } = useTranslation('planner');
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newCollaborator: Collaborator = {
      id: Math.random().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: selectedRole,
    };

    setCollaborators([...collaborators, newCollaborator]);
    setInviteEmail('');
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  const getInitial = (name: string) => {
    return name && name.length > 0 ? name[0].toUpperCase() : '?';
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{t('collaborators.inviteTitle')}</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('collaborators.emailPlaceholder')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="editor">{t('collaborators.editor')}</option>
              <option value="viewer">{t('collaborators.viewer')}</option>
            </select>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t('collaborators.invite')}
            </button>
          </div>
        </form>
      </div>

      {/* Collaborators List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{t('collaborators.currentCollaborators')}</h2>
        <div className="space-y-4">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {collaborator.avatar ? (
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                    {getInitial(collaborator.name)}
                  </div>
                )}
                <div>
                  <div className="font-medium">{collaborator.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {collaborator.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm
                  ${collaborator.role === 'owner' 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-gray-100 text-gray-600'}`}
                >
                  {collaborator.role === 'owner' ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                </div>
                {collaborator.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripCollaborators;