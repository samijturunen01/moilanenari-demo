/**
 * Company facts — every value here is taken from the current moilanenari.fi
 * (header, front page and "Ota yhteyttä" page). Do not add unverified claims.
 */
export const company = {
  name: 'Moilanen Ari',
  domain: 'MoilanenAri.fi',
  address: {
    street: 'Lylykoskentie 9 C 22–24',
    postalCode: '80130',
    city: 'Joensuu',
  },
  phone: {
    display: '050 400 5883',
    international: '+358 50 400 5883',
    href: 'tel:+358504005883',
  },
  email: 'info@moilanenari.fi',
  openingHours: 'Ma–pe sopimuksen mukaan',
  visitNote: 'Soita, jos olet tulossa paikan päälle.',
  delivery: 'Toimitustapa sovittavissa',
  financing: {
    label: 'Hae rahoitusta',
    partner: 'Rahoitusturva',
    href: 'https://rahoitusturva.fi/lainahakemus/?kumppani=MoilanenAri',
  },
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Lylykoskentie+9+80130+Joensuu',
  vatNote: 'Hinnat sisältävät ALV 25,5 %',
} as const
