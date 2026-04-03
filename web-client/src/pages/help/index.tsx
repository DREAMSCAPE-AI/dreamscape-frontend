import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  Search,
  ShoppingCart,
  CreditCard,
  Sparkles,
  Glasses,
  UserCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Mail,
  ExternalLink,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const guides = [
  {
    id: 'prise-en-main',
    icon: Rocket,
    title: 'Prise en main',
    description: "Créer un compte, se connecter, configurer son profil et découvrir l'interface.",
    color: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'recherche',
    icon: Search,
    title: 'Recherche de voyages',
    description: "Trouver des vols et des hôtels, utiliser les filtres et consulter les fiches détaillées.",
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'panier',
    icon: ShoppingCart,
    title: 'Panier & Réservation',
    description: "Gérer son panier, renseigner les informations des voyageurs et finaliser une réservation.",
    color: 'bg-green-50 text-green-600',
  },
  {
    id: 'paiement',
    icon: CreditCard,
    title: 'Paiement sécurisé',
    description: "Procéder au paiement, comprendre les modes de paiement acceptés et obtenir sa confirmation.",
    color: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'ia',
    icon: Sparkles,
    title: 'Recommandations IA',
    description: "Comprendre et personnaliser les suggestions de voyages générées par l'intelligence artificielle.",
    color: 'bg-pink-50 text-pink-600',
  },
  {
    id: 'vr',
    icon: Glasses,
    title: 'Expérience VR & Panorama',
    description: "Explorer des destinations en réalité virtuelle à 360°, sur navigateur ou avec un casque VR.",
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'profil',
    icon: UserCircle,
    title: 'Mon profil & Paramètres',
    description: "Mettre à jour ses informations, gérer ses préférences de voyage et les notifications.",
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    id: 'rgpd',
    icon: ShieldCheck,
    title: 'Confidentialité & Données',
    description: "Comprendre vos droits RGPD, gérer vos consentements et faire une demande de données.",
    color: 'bg-teal-50 text-teal-600',
  },
] as const;

interface Step {
  heading: string;
  content: string[];
}

interface SectionData {
  title: string;
  steps: Step[];
}

const sections: Record<string, SectionData> = {
  'prise-en-main': {
    title: 'Prise en main',
    steps: [
      {
        heading: '1. Créer un compte',
        content: [
          "Rendez-vous sur DreamScape et cliquez sur \"S'inscrire\".",
          "Renseignez votre adresse e-mail et choisissez un mot de passe sécurisé (minimum 8 caractères).",
          "Acceptez les conditions d'utilisation, puis cliquez sur \"Créer mon compte\".",
          "Vérifiez votre boîte mail et confirmez votre adresse via le lien reçu.",
        ],
      },
      {
        heading: '2. Se connecter',
        content: [
          "Cliquez sur \"Se connecter\" et entrez vos identifiants.",
          "En cas d'oubli, cliquez sur \"Mot de passe oublié ?\" pour recevoir un lien de réinitialisation par e-mail.",
        ],
      },
      {
        heading: '3. Configurer son profil (Onboarding)',
        content: [
          "Lors de votre première connexion, un questionnaire vous guide pour personnaliser votre expérience : destinations, budget, type de voyage, hébergement et activités.",
          "Ces préférences alimentent l'IA de recommandation. Vous pouvez les modifier à tout moment dans Mon Profil > Préférences.",
        ],
      },
      {
        heading: "4. Découvrir l'interface",
        content: [
          "Le tableau de bord regroupe la barre de recherche, vos recommandations personnalisées, vos voyages en cours, l'accès à la VR et votre panier.",
        ],
      },
    ],
  },
  recherche: {
    title: 'Recherche de voyages',
    steps: [
      {
        heading: 'Rechercher un vol',
        content: [
          "Depuis le tableau de bord, cliquez sur \"Rechercher un vol\".",
          "Indiquez le départ, la destination, les dates, le nombre de voyageurs et la classe souhaitée.",
          "Les résultats affichent compagnie, horaires, durée, escales et prix en temps réel.",
          "Utilisez le filtre \"Vols directs uniquement\" pour exclure les escales.",
        ],
      },
      {
        heading: 'Rechercher un hôtel',
        content: [
          "Cliquez sur \"Rechercher un hôtel\" et renseignez la destination, les dates de check-in/check-out, le nombre de voyageurs et de chambres.",
          "Filtrez par prix, nombre d'étoiles, équipements (piscine, Wi-Fi…), politique d'annulation et note clients.",
        ],
      },
      {
        heading: 'Fiche détaillée',
        content: [
          "Cliquez sur un résultat pour accéder aux photos, à la carte, aux avis clients et aux conditions tarifaires.",
          "Un bouton \"Explorer en VR\" est disponible sur les fiches qui proposent une expérience panoramique.",
          "Depuis la fiche, sélectionnez vos options puis cliquez sur \"Ajouter au panier\".",
        ],
      },
    ],
  },
  panier: {
    title: 'Panier & Réservation',
    steps: [
      {
        heading: 'Gérer le panier',
        content: [
          "Accédez à votre panier via l'icône 🛒 en haut à droite.",
          "Chaque article affiche le type (vol / hôtel), les dates, le prix et la disponibilité.",
          "Vous pouvez modifier les options ou supprimer un article à tout moment.",
          "Attention : les prix peuvent évoluer. DreamScape vous alertera en cas de changement tarifaire.",
        ],
      },
      {
        heading: 'Finaliser la réservation',
        content: [
          "Cliquez sur \"Procéder au paiement\".",
          "Renseignez les informations des voyageurs (prénom, nom, date de naissance, document d'identité pour les vols).",
          "Vérifiez le récapitulatif final puis cliquez sur \"Confirmer et payer\".",
        ],
      },
      {
        heading: 'Confirmation et Mes voyages',
        content: [
          "Après paiement, vous recevez un e-mail de confirmation avec le récapitulatif complet.",
          "Vos réservations apparaissent dans \"Mes voyages\" avec les statuts : À venir, En cours, Passés, Annulés.",
          "Billets et vouchers sont disponibles au téléchargement depuis \"Mes voyages\".",
        ],
      },
    ],
  },
  paiement: {
    title: 'Paiement sécurisé',
    steps: [
      {
        heading: 'Modes de paiement acceptés',
        content: [
          "DreamScape accepte les cartes bancaires Visa, Mastercard et American Express.",
          "Le paiement est sécurisé par Stripe et chiffré via HTTPS. Vos données bancaires ne sont jamais stockées sur nos serveurs.",
        ],
      },
      {
        heading: 'Effectuer un paiement',
        content: [
          "Depuis le récapitulatif de votre panier, cliquez sur \"Confirmer et payer\".",
          "Saisissez vos informations de carte dans le formulaire sécurisé.",
          "Validez la transaction. Une confirmation s'affiche immédiatement et vous recevez un reçu par e-mail.",
        ],
      },
      {
        heading: "En cas d'échec",
        content: [
          "Vérifiez que les informations saisies sont correctes et que votre carte n'est pas expirée.",
          "Si le problème persiste, contactez votre banque ou notre support.",
        ],
      },
    ],
  },
  ia: {
    title: 'Recommandations IA',
    steps: [
      {
        heading: 'Comment ça fonctionne',
        content: [
          "DreamScape analyse vos préférences (destinations, budget, type de voyage), votre historique de recherches et vos favoris pour générer des suggestions personnalisées.",
          "Les recommandations apparaissent sur votre tableau de bord et sur la page Destinations.",
        ],
      },
      {
        heading: 'Affiner les suggestions',
        content: [
          "Mettez des destinations en favoris ❤️ pour renforcer les recommandations dans ce sens.",
          "Mettez à jour vos préférences de voyage dans Mon Profil > Préférences.",
          "Plus vous utilisez DreamScape, plus les suggestions s'affinent.",
        ],
      },
    ],
  },
  vr: {
    title: 'Expérience VR & Panorama',
    steps: [
      {
        heading: 'Accéder à la VR',
        content: [
          "Depuis la fiche d'une destination ou d'un hôtel, cliquez sur \"Explorer en VR\" si l'option est disponible.",
          "Vous pouvez également accéder à la section VR depuis le tableau de bord.",
        ],
      },
      {
        heading: 'Navigation panoramique',
        content: [
          "Sur navigateur : cliquez et faites glisser pour explorer la vue à 360°. Sur mobile, inclinez votre appareil.",
          "Avec un casque VR compatible (WebXR) : cliquez sur l'icône casque pour entrer en mode immersif.",
        ],
      },
      {
        heading: 'Compatibilité',
        content: [
          "La VR fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Edge, Safari).",
          "Pour l'expérience immersive complète, un casque Meta Quest ou équivalent compatible WebXR est recommandé.",
        ],
      },
    ],
  },
  profil: {
    title: 'Mon profil & Paramètres',
    steps: [
      {
        heading: 'Modifier ses informations',
        content: [
          "Accédez à Mon Profil via le menu en haut à droite.",
          "Vous pouvez modifier votre nom, photo de profil, numéro de téléphone et adresse.",
        ],
      },
      {
        heading: 'Préférences de voyage',
        content: [
          "Dans Mon Profil > Préférences, mettez à jour vos destinations, budget, type de voyage et activités préférées.",
          "Ces préférences influencent directement les recommandations IA.",
        ],
      },
      {
        heading: 'Notifications',
        content: [
          "Dans Paramètres > Notifications, activez ou désactivez les alertes de prix, les confirmations de réservation et les newsletters.",
        ],
      },
      {
        heading: 'Changer de langue',
        content: [
          "Cliquez sur le sélecteur de langue en haut à droite du header pour basculer entre le français et l'anglais.",
        ],
      },
    ],
  },
  rgpd: {
    title: 'Confidentialité & Données',
    steps: [
      {
        heading: 'Vos droits',
        content: [
          "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.",
          "Vous pouvez également vous opposer au traitement de vos données à des fins marketing.",
        ],
      },
      {
        heading: 'Gérer vos consentements',
        content: [
          "Lors de votre première visite, une bannière vous invite à configurer vos consentements (analytique, marketing, fonctionnel).",
          "Vous pouvez modifier vos choix à tout moment dans Paramètres > Confidentialité.",
        ],
      },
      {
        heading: 'Exercer vos droits',
        content: [
          "Depuis Paramètres > Confidentialité, vous pouvez demander l'export de vos données ou la suppression de votre compte.",
          "Votre demande sera traitée dans un délai maximum de 30 jours.",
        ],
      },
    ],
  },
};

const faqs = [
  {
    q: 'Puis-je annuler une réservation ?',
    a: "Les conditions d'annulation dépendent du tarif choisi. Les réservations avec \"Annulation gratuite\" peuvent être annulées sans frais avant la date limite indiquée. Pour les tarifs non remboursables, contactez notre support.",
  },
  {
    q: 'Comment récupérer mes billets ?',
    a: "Vos billets et vouchers sont disponibles dans \"Mes voyages\". Cliquez sur la réservation concernée, puis sur \"Télécharger les billets\".",
  },
  {
    q: "L'expérience VR fonctionne-t-elle sur mobile ?",
    a: "Oui, la navigation panoramique est disponible sur mobile en mode gyroscope. Pour l'expérience VR complète avec un casque, un appareil compatible WebXR est requis.",
  },
  {
    q: 'Mes données de carte bancaire sont-elles stockées ?',
    a: "Non. DreamScape utilise Stripe pour le traitement des paiements. Vos données bancaires sont gérées directement par Stripe et ne transitent pas sur nos serveurs.",
  },
  {
    q: 'Comment désactiver les recommandations IA ?',
    a: "Les recommandations ne peuvent pas être complètement désactivées car elles font partie du coeur de l'expérience DreamScape. Vous pouvez cependant limiter la collecte de données dans Paramètres > Confidentialité.",
  },
  {
    q: 'Comment supprimer mon compte ?',
    a: "Rendez-vous dans Paramètres > Confidentialité > Mes données, puis cliquez sur \"Supprimer mon compte\". Cette action est irréversible.",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GuideCard({
  guide,
  onClick,
}: {
  guide: (typeof guides)[number];
  onClick: () => void;
}) {
  const Icon = guide.icon;
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all text-left"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${guide.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
          {guide.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{guide.description}</p>
      </div>
    </button>
  );
}

function SectionDetail({ sectionKey }: { sectionKey: string }) {
  const section = sections[sectionKey];
  if (!section) return null;
  return (
    <div className="space-y-6">
      {section.steps.map((step) => (
        <div key={step.heading}>
          <h4 className="font-semibold text-gray-800 mb-2">{step.heading}</h4>
          <ul className="space-y-1.5">
            {step.content.map((line, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800 text-sm">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 bg-white text-sm text-gray-600 leading-relaxed border-t border-gray-100">
          {a}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleGuideClick = (id: string) => {
    const next = id === activeSection ? null : id;
    setActiveSection(next);
    if (next) {
      setTimeout(() => {
        document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Centre d'aide DreamScape</h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto">
            Retrouvez tous les guides pour utiliser DreamScape, de la création de compte jusqu'à l'expérience VR.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
        {/* Guides grid */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Guides par fonctionnalité</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onClick={() => handleGuideClick(guide.id)}
              />
            ))}
          </div>
        </section>

        {/* Detailed sections */}
        <section className="mb-14 space-y-4">
          {guides.map((guide) => {
            const Icon = guide.icon;
            const isOpen = activeSection === guide.id;
            return (
              <div
                key={guide.id}
                id={`section-${guide.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setActiveSection(isOpen ? null : guide.id)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${guide.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">{guide.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-5">
                      <SectionDetail sectionKey={guide.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-gray-500 mb-6">Notre équipe support est disponible pour vous aider.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/support"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-shadow"
            >
              <Mail className="w-4 h-4" />
              Contacter le support
            </Link>
            <a
              href="mailto:support@dreamscape.ai"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              support@dreamscape.ai
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
