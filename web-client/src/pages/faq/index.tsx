import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface FaqEntry {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  emoji: string;
  entries: FaqEntry[];
}

const categories: FaqCategory[] = [
  {
    id: 'compte',
    label: 'Compte & Connexion',
    emoji: '👤',
    entries: [
      {
        q: "Comment créer un compte DreamScape ?",
        a: "Cliquez sur \"S'inscrire\" depuis la page d'accueil. Renseignez votre adresse e-mail et un mot de passe (minimum 8 caractères), acceptez les conditions d'utilisation, puis confirmez votre adresse via le lien reçu par mail.",
      },
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Cliquez sur \"Mot de passe oublié ?\" sur la page de connexion. Entrez votre adresse e-mail et suivez les instructions reçues par mail pour créer un nouveau mot de passe.",
      },
      {
        q: "Puis-je me connecter avec Google ?",
        a: "Oui, DreamScape propose la connexion via votre compte Google pour un accès rapide sans mot de passe.",
      },
      {
        q: "Comment modifier mon adresse e-mail ?",
        a: "Rendez-vous dans Paramètres > Mon compte. Cliquez sur \"Modifier l'e-mail\", saisissez la nouvelle adresse et confirmez via le lien de validation envoyé.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Allez dans Paramètres > Confidentialité > Mes données, puis cliquez sur \"Supprimer mon compte\". Cette action est définitive et entraîne la suppression de toutes vos données.",
      },
      {
        q: "Mon compte est bloqué, que faire ?",
        a: "Après plusieurs tentatives de connexion échouées, votre compte peut être temporairement bloqué. Attendez 30 minutes avant de réessayer ou contactez le support.",
      },
    ],
  },
  {
    id: 'recherche',
    label: 'Recherche de voyages',
    emoji: '🔍',
    entries: [
      {
        q: "Comment rechercher un vol ?",
        a: "Depuis le tableau de bord, cliquez sur \"Rechercher un vol\". Indiquez le départ, la destination, les dates, le nombre de voyageurs et la classe souhaitée. Les résultats s'affichent en temps réel grâce à notre intégration Amadeus.",
      },
      {
        q: "Puis-je rechercher des vols aller simple ?",
        a: "Oui. Lors de la recherche, ne renseignez pas de date de retour pour obtenir uniquement des vols aller simple.",
      },
      {
        q: "Comment filtrer les résultats de vols ?",
        a: "Utilisez les filtres disponibles : compagnie aérienne, horaires, nombre d'escales, classe de voyage et plage de prix. Le filtre \"Vols directs uniquement\" exclut les vols avec escale.",
      },
      {
        q: "Les prix affichés sont-ils définitifs ?",
        a: "Les prix sont affichés en temps réel et peuvent fluctuer. Le prix définitif est confirmé lors de la validation du paiement. DreamScape vous alertera si le prix change entre l'ajout au panier et le paiement.",
      },
      {
        q: "Comment rechercher un hôtel ?",
        a: "Cliquez sur \"Rechercher un hôtel\", renseignez la destination, les dates de check-in et check-out, le nombre de voyageurs et de chambres. Filtrez par prix, étoiles, équipements et note clients.",
      },
      {
        q: "Puis-je combiner vol et hôtel dans une même recherche ?",
        a: "Vous pouvez ajouter séparément un vol et un hôtel à votre panier et les réserver en une seule transaction.",
      },
      {
        q: "Mes recherches sont-elles sauvegardées ?",
        a: "Oui, votre historique de recherches est accessible depuis Mon Profil > Historique. Il permet aussi à l'IA d'affiner vos recommandations.",
      },
    ],
  },
  {
    id: 'reservation',
    label: 'Réservation & Panier',
    emoji: '🛒',
    entries: [
      {
        q: "Comment réserver un vol ou un hôtel ?",
        a: "Depuis la fiche détaillée d'un vol ou d'un hôtel, sélectionnez vos options et cliquez sur \"Ajouter au panier\". Finalisez ensuite votre réservation depuis le panier en renseignant les informations des voyageurs.",
      },
      {
        q: "Combien de temps mes articles restent-ils dans le panier ?",
        a: "Votre panier est conservé pendant 24 heures. Au-delà, les articles expirés doivent être ajoutés à nouveau. Les disponibilités et prix peuvent avoir changé.",
      },
      {
        q: "Puis-je modifier une réservation après confirmation ?",
        a: "La modification dépend des conditions tarifaires choisies. Depuis \"Mes voyages\", cliquez sur la réservation et vérifiez les options disponibles. En cas de doute, contactez le support.",
      },
      {
        q: "Puis-je annuler une réservation ?",
        a: "Les conditions d'annulation dépendent du tarif. Les tarifs \"Annulation gratuite\" permettent l'annulation sans frais avant la date limite. Les tarifs non remboursables ne donnent pas droit au remboursement.",
      },
      {
        q: "Comment obtenir mes billets et vouchers ?",
        a: "Vos billets et vouchers sont disponibles dans \"Mes voyages\". Cliquez sur la réservation concernée puis sur \"Télécharger les billets\". Un e-mail de confirmation vous est également envoyé automatiquement.",
      },
      {
        q: "Que faire si je ne reçois pas l'e-mail de confirmation ?",
        a: "Vérifiez votre dossier spam. Si l'e-mail n'est pas présent, votre réservation est visible dans \"Mes voyages\". Contactez le support si le statut affiche une erreur.",
      },
    ],
  },
  {
    id: 'paiement',
    label: 'Paiement',
    emoji: '💳',
    entries: [
      {
        q: "Quels modes de paiement sont acceptés ?",
        a: "DreamScape accepte les cartes Visa, Mastercard et American Express. Le paiement est sécurisé par Stripe.",
      },
      {
        q: "Mes données bancaires sont-elles stockées ?",
        a: "Non. DreamScape utilise Stripe pour le traitement des paiements. Vos données bancaires sont gérées exclusivement par Stripe et ne transitent pas sur nos serveurs.",
      },
      {
        q: "Pourquoi mon paiement est-il refusé ?",
        a: "Vérifiez que les informations saisies sont correctes (numéro, date d'expiration, CVV), que votre carte n'est pas expirée et que vous disposez de fonds suffisants. Si le problème persiste, contactez votre banque.",
      },
      {
        q: "Est-ce que je peux payer en plusieurs fois ?",
        a: "Le paiement en plusieurs fois n'est pas disponible directement sur DreamScape. Certaines cartes bancaires proposent cette option de leur côté.",
      },
      {
        q: "Comment obtenir une facture ?",
        a: "Votre reçu de paiement est envoyé par e-mail et disponible dans \"Mes voyages\" > détail de la réservation > \"Télécharger la facture\".",
      },
    ],
  },
  {
    id: 'ia',
    label: 'Recommandations IA',
    emoji: '🤖',
    entries: [
      {
        q: "Comment fonctionne le système de recommandations ?",
        a: "L'IA analyse vos préférences (destinations, budget, type de voyage), votre historique de recherches et vos favoris pour générer des suggestions personnalisées. Plus vous utilisez DreamScape, plus les recommandations s'affinent.",
      },
      {
        q: "Puis-je personnaliser mes recommandations ?",
        a: "Oui. Mettez des destinations en favoris, mettez à jour vos préférences dans Mon Profil > Préférences et interagissez avec les suggestions pour aider l'IA à mieux vous connaître.",
      },
      {
        q: "Pourquoi je vois toujours les mêmes destinations suggérées ?",
        a: "Les recommandations se basent sur vos préférences actuelles. Mettez-les à jour dans Mon Profil > Préférences ou explorez de nouvelles destinations via la carte pour diversifier les suggestions.",
      },
      {
        q: "Puis-je désactiver les recommandations ?",
        a: "Les recommandations font partie du coeur de l'expérience DreamScape et ne peuvent pas être complètement désactivées. Vous pouvez limiter la collecte de données dans Paramètres > Confidentialité.",
      },
    ],
  },
  {
    id: 'vr',
    label: 'Expérience VR & Panorama',
    emoji: '🥽',
    entries: [
      {
        q: "Comment accéder à l'expérience VR ?",
        a: "Depuis la fiche d'une destination ou d'un hôtel, cliquez sur \"Explorer en VR\" si l'option est disponible. Vous pouvez aussi accéder à la section VR depuis le tableau de bord.",
      },
      {
        q: "L'expérience VR fonctionne-t-elle sur mobile ?",
        a: "Oui, la navigation panoramique à 360° est disponible sur mobile via le gyroscope. Pour l'immersion complète, un casque compatible WebXR (ex. Meta Quest) est recommandé.",
      },
      {
        q: "Quels navigateurs sont compatibles ?",
        a: "La VR fonctionne sur Chrome, Firefox, Edge et Safari (versions récentes). Pour le mode immersif avec casque, Chrome ou Edge avec support WebXR est recommandé.",
      },
      {
        q: "La VR est lente ou saccadée, que faire ?",
        a: "Fermez les autres onglets et applications pour libérer de la mémoire. Réduisez la qualité graphique dans les paramètres VR si l'option est disponible. Vérifiez votre connexion internet.",
      },
    ],
  },
  {
    id: 'rgpd',
    label: 'Confidentialité & RGPD',
    emoji: '🔒',
    entries: [
      {
        q: "Quelles données DreamScape collecte-t-il ?",
        a: "DreamScape collecte vos données de compte (nom, e-mail), vos préférences de voyage, votre historique de recherches et de réservations, ainsi que des données de navigation (cookies analytiques si vous avez consenti).",
      },
      {
        q: "Comment gérer mes consentements cookies ?",
        a: "Lors de votre première visite, une bannière vous propose de configurer vos consentements. Vous pouvez les modifier à tout moment dans Paramètres > Confidentialité > Gestion des consentements.",
      },
      {
        q: "Comment récupérer mes données personnelles ?",
        a: "Depuis Paramètres > Confidentialité > Mes données, cliquez sur \"Exporter mes données\". Vous recevrez un fichier contenant toutes vos données dans un délai de 30 jours.",
      },
      {
        q: "Comment demander la suppression de mes données ?",
        a: "Depuis Paramètres > Confidentialité > Mes données, cliquez sur \"Supprimer mon compte et mes données\". La suppression est effective dans un délai de 30 jours conformément au RGPD.",
      },
      {
        q: "DreamScape partage-t-il mes données avec des tiers ?",
        a: "DreamScape partage uniquement les données nécessaires avec ses partenaires (Amadeus pour les vols et hôtels, Stripe pour les paiements, OpenAI pour les recommandations IA). Aucune vente de données à des tiers.",
      },
      {
        q: "Puis-je m'opposer au traitement de mes données à des fins marketing ?",
        a: "Oui. Dans Paramètres > Confidentialité > Gestion des consentements, désactivez le consentement \"Marketing\" pour ne plus recevoir de communications commerciales.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800 text-sm pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FaqPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return categories.flatMap((cat) =>
      cat.entries
        .filter((e) => e.q.toLowerCase().includes(q) || e.a.toLowerCase().includes(q))
        .map((e) => ({ ...e, category: cat.label }))
    );
  }, [query]);

  const displayedCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  const totalQuestions = categories.reduce((acc, c) => acc + c.entries.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Foire aux questions</h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto mb-8">
            {totalQuestions} réponses aux questions les plus fréquentes sur DreamScape.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-800 placeholder-gray-400 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">

        {/* Search results */}
        {query.trim() && (
          <section className="mb-10">
            {filtered && filtered.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour &laquo;&nbsp;{query}&nbsp;&raquo;
                </p>
                <div className="space-y-3">
                  {filtered.map((e) => (
                    <div key={e.q}>
                      <p className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-1 px-1">
                        {e.category}
                      </p>
                      <FaqItem q={e.q} a={e.a} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-gray-600">Aucun résultat pour &laquo;&nbsp;{query}&nbsp;&raquo;</p>
                <p className="text-sm mt-1">Essayez d'autres mots-clés ou consultez le <Link to="/support" className="text-orange-500 hover:underline">support</Link>.</p>
              </div>
            )}
          </section>
        )}

        {/* Category filter */}
        {!query.trim() && (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                }`}
              >
                Toutes les catégories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ by category */}
            <div className="space-y-10">
              {displayedCategories.map((cat) => (
                <section key={cat.id} id={cat.id}>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    {cat.label}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      ({cat.entries.length})
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {cat.entries.map((entry) => (
                      <FaqItem key={entry.q} q={entry.q} a={entry.a} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        {/* Footer CTA */}
        <div className="mt-14 bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Toujours pas de réponse ?
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Consultez notre guide complet ou contactez notre équipe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/help"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Centre d'aide
            </Link>
            <Link
              to="/support"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-shadow"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
