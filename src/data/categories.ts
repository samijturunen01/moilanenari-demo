import type { Category } from '../types/catalog'

/**
 * Nine departments replace the ~80 overlapping WooCommerce categories of the
 * current site. Mapping rules live in scripts/curation.mjs.
 */
export const categories: Category[] = [
  {
    id: 'kypsennys',
    index: '01',
    coverProductId: 4006,
    name: 'Uunit ja liedet',
    description: 'Yhdistelmä- ja kiertoilmauunit, liedet, padat, paistinpannut ja rasvakeittimet.',
  },
  {
    id: 'kylmalaitteet',
    index: '02',
    coverProductId: 2975,
    name: 'Kylmälaitteet',
    description: 'Kylmäkaapit, kylmäaltaat, kylmähauteet ja juomajakelimet.',
  },
  {
    id: 'jakelu',
    index: '03',
    coverProductId: 3137,
    name: 'Ruoanjakelu ja linjastot',
    description: 'Lämpöhaudevaunut, lämpöpöydät, tarjotinvaunut ja kuljetusvaunut.',
  },
  {
    id: 'rst-kalusteet',
    index: '04',
    coverProductId: 3370,
    name: 'Rst-kalusteet',
    description: 'Ruostumattomat pöydät, allaspöydät, kaapit, hyllyt ja vaunut.',
  },
  {
    id: 'esikasittely',
    index: '05',
    coverProductId: 2557,
    name: 'Yleiskoneet ja esikäsittely',
    description: 'Yleiskoneet, vihannesleikkurit, kutterit, kuorimakoneet ja leipomolaitteet.',
  },
  {
    id: 'kahvi',
    index: '06',
    coverProductId: 2603,
    name: 'Kahvi ja juomat',
    description: 'Säiliökahvinkeittimet, kahvinkeittimet, kahvivaunut ja kuumajuomalaitteet.',
  },
  {
    id: 'astianpesu',
    index: '07',
    coverProductId: 3604,
    name: 'Astianpesu',
    description: 'Astianpesukoneet, korivaunut ja jalustat.',
  },
  {
    id: 'peravaunut',
    index: '08',
    coverProductId: 4235,
    name: 'Eurowagon-perävaunut',
    description: 'Kotimaiset Eurowagon-tavarankuljetusperävaunut.',
  },
  {
    id: 'muut',
    index: '09',
    coverProductId: 3778,
    name: 'Muut tuotteet',
    description: 'Työkoneet, pakkauslaitteet, astiat, valomainokset ja kalusteet.',
  },
]
