// Textes et paramètres fixes, centralisés pour être modifiés facilement.
export const SITE = {
  name: 'Togo Pharma',
  defaultCity: 'Lomé',
  // Centre de Lomé, utilisé tant que l'utilisateur n'a pas choisi de quartier ni partagé sa position.
  defaultCenter: { lat: 6.1375, lng: 1.2123 },
  health: {
    title: 'Une question de santé ?',
    text: 'Un pharmacien vous répond sans que vous ayez à vous déplacer.',
  },
  pharmacistCta: {
    title: 'Vous êtes pharmacien ?',
    text: 'Gérez votre garde, vos stocks et les demandes de vos clients.',
  },
  quickActions: [
    { key: 'check', label: 'Vérifier un produit', icon: 'box', to: '/demande/check' },
    { key: 'prescription', label: 'Envoyer une ordonnance', icon: 'file', to: '/demande/prescription' },
    { key: 'reserve', label: 'Réserver', icon: 'calendar', to: '/demande/reserve' },
    { key: 'delivery', label: 'Livraison', icon: 'truck', to: '/carte?delivery=true' },
    { key: 'talk', label: 'Parler au pharmacien', icon: 'chat', to: '/messages' },
    { key: 'urgent', label: 'Urgences', icon: 'alert', to: '/carte?on_call=true&open_now=true', danger: true },
    { key: 'reminders', label: 'Rappels', icon: 'alarm', to: '/rappels' },
    { key: 'favorites', label: 'Mes favoris', icon: 'heart', to: '/favoris' },
  ],
}

export const HOME_SERVICES = [
  {
    icon: 'search',
    title: 'Recherche de pharmacies',
    text: 'Repérez les pharmacies référencées et trouvez celle qui répond à votre besoin.',
  },
  {
    icon: 'clock',
    title: 'Pharmacies de garde',
    text: 'Consultez les pharmacies assurant le service de garde selon les informations disponibles.',
  },
  {
    icon: 'map',
    title: 'Localisation sur carte',
    text: 'Visualisez les pharmacies et explorez leur emplacement sur une carte interactive.',
  },
  {
    icon: 'nav',
    title: 'Itinéraires',
    text: 'Ouvrez un itinéraire vers la pharmacie sélectionnée pour préparer votre déplacement.',
  },
  {
    icon: 'info',
    title: 'Informations pratiques',
    text: 'Retrouvez les adresses, contacts et horaires lorsqu’ils ont été renseignés.',
  },
]

export const HOME_STEPS = [
  { number: '01', title: 'Recherchez une pharmacie', text: 'Cherchez par nom ou explorez les pharmacies de garde.' },
  { number: '02', title: 'Consultez ses informations', text: 'Vérifiez son adresse, sa localisation et les informations disponibles.' },
  { number: '03', title: 'Obtenez votre itinéraire', text: 'Lancez le trajet vers la pharmacie choisie.' },
]
