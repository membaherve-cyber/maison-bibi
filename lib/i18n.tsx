"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "fr" | "en";

type Dict = Record<string, { fr: string; en: string }>;

export const dict: Dict = {
  "nav.home": { fr: "Accueil", en: "Home" },
  "nav.properties": { fr: "Propriétés", en: "Properties" },
  "nav.sale": { fr: "À vendre", en: "For sale" },
  "nav.rent": { fr: "À louer", en: "For rent" },
  "nav.services": { fr: "Services", en: "Services" },
  "nav.contact": { fr: "Contact", en: "Contact" },
  "nav.menu": { fr: "Menu", en: "Menu" },
  "nav.close": { fr: "Fermer", en: "Close" },
  "nav.language": { fr: "Langue", en: "Language" },

  "hero.badge": {
    fr: "Courtier immobilier",
    en: "Real estate broker",
  },
  "hero.title": {
    fr: "Trouvez la propriété qui correspond à vos projets.",
    en: "Find the property that matches your plans.",
  },
  "hero.subtitle": {
    fr: "Villas, appartements, immeubles et espaces professionnels sélectionnés à Douala et au Cameroun, vérifiés et accompagnés par nos conseillers.",
    en: "Villas, apartments, buildings and professional spaces selected across Douala and Cameroon, verified and supported by our advisors.",
  },
  "hero.search": { fr: "Rechercher", en: "Search" },
  "hero.advanced": { fr: "Recherche avancée", en: "Advanced search" },
  "hero.stat1": { fr: "Biens vérifiés", en: "Verified listings" },
  "hero.stat2": { fr: "Quartiers couverts", en: "Districts covered" },
  "hero.stat3": { fr: "Accompagnement", en: "Client support" },

  "search.transaction": { fr: "Transaction", en: "Transaction" },
  "search.type": { fr: "Type de bien", en: "Property type" },
  "search.city": { fr: "Ville", en: "City" },
  "search.neighborhood": { fr: "Quartier", en: "Neighbourhood" },
  "search.keyword": { fr: "Mot-clé, quartier, référence", en: "Keyword, area, reference" },
  "search.all": { fr: "Tous", en: "All" },
  "search.allTypes": { fr: "Tous les types", en: "All types" },
  "search.allCities": { fr: "Toutes les villes", en: "All cities" },
  "search.allNeighborhoods": { fr: "Tous les quartiers", en: "All neighbourhoods" },
  "search.priceMin": { fr: "Prix min (FCFA)", en: "Min price (FCFA)" },
  "search.priceMax": { fr: "Prix max (FCFA)", en: "Max price (FCFA)" },
  "search.surfaceMin": { fr: "Surface min (m²)", en: "Min surface (sqm)" },
  "search.bedrooms": { fr: "Chambres min", en: "Min bedrooms" },
  "search.bathrooms": { fr: "Salles de bains min", en: "Min bathrooms" },
  "search.amenities": { fr: "Commodités", en: "Amenities" },
  "search.reset": { fr: "Réinitialiser les filtres", en: "Reset filters" },
  "search.results": { fr: "propriété(s) trouvée(s)", en: "property(ies) found" },
  "search.noResults": { fr: "Aucune propriété ne correspond à votre recherche.", en: "No property matches your search." },
  "search.noResultsHint": {
    fr: "Élargissez vos critères ou contactez-nous : de nouveaux biens arrivent chaque semaine.",
    en: "Widen your criteria or contact us: new listings arrive every week.",
  },
  "search.sort": { fr: "Trier", en: "Sort" },
  "search.sortRecent": { fr: "Sélection", en: "Selection" },
  "search.sortPriceAsc": { fr: "Prix croissant", en: "Price: low to high" },
  "search.sortPriceDesc": { fr: "Prix décroissant", en: "Price: high to low" },
  "search.filters": { fr: "Filtres", en: "Filters" },

  "tx.sale": { fr: "À vendre", en: "For sale" },
  "tx.rent": { fr: "À louer", en: "For rent" },

  "page.propertiesTitle": { fr: "Toutes nos propriétés", en: "All our properties" },
  "page.propertiesSub": {
    fr: "Filtrez par transaction, type de bien, quartier, budget, surface et commodités.",
    en: "Filter by transaction, property type, district, budget, surface and amenities.",
  },
  "eyebrow.selection": { fr: "Notre portefeuille", en: "Our portfolio" },
  "eyebrow.districts": { fr: "Douala & Yaoundé", en: "Douala & Yaoundé" },
  "eyebrow.services": { fr: "Accompagnement", en: "Support" },
  "eyebrow.why": { fr: "Notre engagement", en: "Our commitment" },
  "section.selected": { fr: "Propriétés sélectionnées", en: "Selected properties" },
  "section.selectedSub": {
    fr: "Une sélection resserrée de biens vérifiés par nos conseillers à Douala.",
    en: "A tight selection of listings verified by our advisors in Douala.",
  },
  "section.viewAll": { fr: "Voir toutes les propriétés", en: "View all properties" },
  "section.services": { fr: "Nos services", en: "Our services" },
  "section.servicesSub": {
    fr: "Un accompagnement complet, de la recherche à la remise des clés.",
    en: "Full support, from the search to the handover of the keys.",
  },
  "section.why": { fr: "Pourquoi La Maison Bibi", en: "Why La Maison Bibi" },
  "section.neighborhoods": { fr: "Quartiers à la une", en: "Featured districts" },
  "section.neighborhoodsSub": {
    fr: "Explorez les adresses les plus recherchées de Douala et de Yaoundé.",
    en: "Explore the most sought-after addresses in Douala and Yaoundé.",
  },
  "section.related": { fr: "Propriétés similaires", en: "Similar properties" },

  "card.view": { fr: "Voir la propriété", en: "View property" },
  "card.quickView": { fr: "Aperçu rapide", en: "Quick view" },
  "card.whatsapp": { fr: "WhatsApp", en: "WhatsApp" },
  "card.photos": { fr: "photos", en: "photos" },

  "prop.bedrooms": { fr: "Chambres", en: "Bedrooms" },
  "prop.bathrooms": { fr: "Salles de bains", en: "Bathrooms" },
  "prop.livingRooms": { fr: "Salons", en: "Living rooms" },
  "prop.livingArea": { fr: "Surface habitable", en: "Living area" },
  "prop.landArea": { fr: "Superficie du terrain", en: "Land area" },
  "prop.floor": { fr: "Étage", en: "Floor" },
  "prop.parking": { fr: "Parking", en: "Parking" },
  "prop.condition": { fr: "État", en: "Condition" },
  "prop.type": { fr: "Type de bien", en: "Property type" },
  "prop.transaction": { fr: "Transaction", en: "Transaction" },
  "prop.location": { fr: "Localisation", en: "Location" },
  "prop.price": { fr: "Prix", en: "Price" },
  "prop.description": { fr: "Description", en: "Description" },
  "prop.amenities": { fr: "Commodités et équipements", en: "Amenities and features" },
  "prop.details": { fr: "Caractéristiques", en: "Key details" },
  "prop.gallery": { fr: "Galerie", en: "Gallery" },
  "prop.reference": { fr: "Référence", en: "Reference" },
  "prop.contactTitle": { fr: "Intéressé par ce bien ?", en: "Interested in this property?" },
  "prop.contactSub": {
    fr: "Nos conseillers organisent votre visite sous 24 h.",
    en: "Our advisors arrange your viewing within 24 hours.",
  },
  "prop.requestVisit": { fr: "Demander une visite", en: "Request a viewing" },
  "prop.call": { fr: "Appeler", en: "Call" },
  "prop.spaces": { fr: "places", en: "spaces" },
  "prop.fullPage": { fr: "Voir la propriété", en: "View full property page" },
  "prop.onRequest": { fr: "Prix sur demande", en: "Price on request" },

  "gallery.prev": { fr: "Image précédente", en: "Previous image" },
  "gallery.next": { fr: "Image suivante", en: "Next image" },
  "gallery.close": { fr: "Fermer", en: "Close" },
  "gallery.fullscreen": { fr: "Plein écran", en: "Fullscreen" },

  "common.back": { fr: "Retour", en: "Back" },
  "common.home": { fr: "Accueil", en: "Home" },
  "common.loading": { fr: "Chargement…", en: "Loading…" },
  "common.send": { fr: "Envoyer", en: "Send" },
  "common.sending": { fr: "Envoi…", en: "Sending…" },
  "common.name": { fr: "Nom complet", en: "Full name" },
  "common.email": { fr: "Email", en: "Email" },
  "common.phone": { fr: "Téléphone", en: "Phone" },
  "common.message": { fr: "Message", en: "Message" },
  "common.required": { fr: "Champ obligatoire", en: "Required field" },
  "common.thanks": {
    fr: "Merci, votre demande a bien été envoyée. Nous vous répondons rapidement.",
    en: "Thank you, your request has been sent. We will get back to you shortly.",
  },
  "common.error": {
    fr: "Une erreur est survenue. Merci de réessayer ou de nous appeler.",
    en: "Something went wrong. Please try again or call us.",
  },

  "footer.tagline": { fr: "Votre courtier immobilier", en: "Your real estate broker" },
  "footer.about": {
    fr: "La Maison Bibi accompagne particuliers, entreprises et investisseurs dans la vente, la location et la gestion de biens immobiliers à Douala et au Cameroun.",
    en: "La Maison Bibi supports individuals, companies and investors in the sale, rental and management of real estate in Douala and across Cameroon.",
  },
  "footer.navigation": { fr: "Navigation", en: "Navigation" },
  "footer.contact": { fr: "Contact", en: "Contact" },
  "footer.backoffice": { fr: "Backoffice", en: "Backoffice" },
  "footer.login": { fr: "Connexion", en: "Login" },
  "footer.rights": { fr: "Tous droits réservés.", en: "All rights reserved." },
  "footer.legal": { fr: "Mentions légales", en: "Legal notice" },

  "services.title": { fr: "Nos services immobiliers", en: "Our real estate services" },
  "services.sale": { fr: "Vente de biens", en: "Property sales" },
  "services.saleText": {
    fr: "Estimation, mise en valeur, diffusion et négociation jusqu'à la signature chez le notaire.",
    en: "Valuation, staging, marketing and negotiation through to signature at the notary.",
  },
  "services.rent": { fr: "Location", en: "Rentals" },
  "services.rentText": {
    fr: "Recherche de locataires solvables, visites organisées, rédaction du bail et état des lieux.",
    en: "Search for reliable tenants, organised viewings, lease drafting and inventory reports.",
  },
  "services.management": { fr: "Gestion locative", en: "Property management" },
  "services.managementText": {
    fr: "Encaissement des loyers, suivi technique, entretien et reporting régulier aux propriétaires.",
    en: "Rent collection, technical follow-up, maintenance and regular reporting to owners.",
  },
  "services.advisory": { fr: "Conseil en investissement", en: "Investment advisory" },
  "services.advisoryText": {
    fr: "Analyse du rendement, arbitrage entre quartiers et accompagnement des investisseurs de la diaspora.",
    en: "Yield analysis, district arbitrage and support for diaspora investors.",
  },
  "services.legal": { fr: "Sécurisation juridique", en: "Legal security" },
  "services.legalText": {
    fr: "Vérification des titres fonciers, des documents de propriété et coordination avec le notaire.",
    en: "Verification of land titles, ownership documents and coordination with the notary.",
  },
  "services.visit": { fr: "Visites accompagnées", en: "Guided viewings" },
  "services.visitText": {
    fr: "Visites physiques ou en visioconférence pour les clients installés hors du Cameroun.",
    en: "On-site or video viewings for clients based outside Cameroon.",
  },

  "why.local": { fr: "Connaissance du marché local", en: "Local market knowledge" },
  "why.localText": {
    fr: "Bonapriso, Bonanjo, Akwa, Bonabéri, Yassa : nous connaissons les prix réels quartier par quartier.",
    en: "Bonapriso, Bonanjo, Akwa, Bonabéri, Yassa: we know real prices district by district.",
  },
  "why.verified": { fr: "Biens vérifiés", en: "Verified listings" },
  "why.verifiedText": {
    fr: "Chaque bien publié est visité et ses informations sont contrôlées avant diffusion.",
    en: "Every published property is visited and its information checked before going live.",
  },
  "why.service": { fr: "Service sur mesure", en: "Tailored service" },
  "why.serviceText": {
    fr: "Un conseiller dédié, joignable par téléphone et WhatsApp, du premier contact à la remise des clés.",
    en: "A dedicated advisor, reachable by phone and WhatsApp, from first contact to key handover.",
  },

  "contact.title": { fr: "Contactez La Maison Bibi", en: "Contact La Maison Bibi" },
  "contact.subtitle": {
    fr: "Un projet d'achat, de location ou de gestion ? Écrivez-nous, nous répondons sous 24 h ouvrées.",
    en: "A purchase, rental or management project? Write to us, we reply within 24 working hours.",
  },
  "contact.form": { fr: "Formulaire de contact", en: "Contact form" },
  "contact.hours": { fr: "Lundi — Samedi, 8h à 19h", en: "Monday — Saturday, 8am to 7pm" },
  "contact.office": { fr: "Douala, Cameroun", en: "Douala, Cameroon" },

  "bibi.title": { fr: "Bibi, votre assistante", en: "Bibi, your assistant" },
  "bibi.subtitle": { fr: "En ligne — réponse immédiate", en: "Online — instant answers" },
  "bibi.open": { fr: "Discuter avec Bibi", en: "Chat with Bibi" },
  "bibi.close": { fr: "Fermer Bibi", en: "Close Bibi" },
  "bibi.placeholder": { fr: "Posez votre question…", en: "Ask your question…" },
  "bibi.welcome": {
    fr: "Bonjour, je suis Bibi. Dites-moi ce que vous cherchez : un appartement à louer à Akwa, une villa à vendre à Bonapriso, un entrepôt à Bonabéri…",
    en: "Hello, I'm Bibi. Tell me what you are looking for: an apartment to rent in Akwa, a villa for sale in Bonapriso, a warehouse in Bonabéri…",
  },
  "bibi.q1": { fr: "Villas à vendre", en: "Villas for sale" },
  "bibi.q2": { fr: "Appartements à louer", en: "Apartments to rent" },
  "bibi.q3": { fr: "Parler à un conseiller", en: "Talk to an advisor" },

  "admin.title": { fr: "Backoffice", en: "Backoffice" },
  "login.title": { fr: "Connexion au backoffice", en: "Backoffice login" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };

const I18nContext = createContext<Ctx>({
  lang: "fr",
  setLang: () => {},
  t: (key) => dict[key]?.fr ?? key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("lmdb-lang");
    if (stored === "en" || stored === "fr") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("lmdb-lang", l);
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = dict[key];
      if (!entry) return key;
      return lang === "en" ? entry.en : entry.fr;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
