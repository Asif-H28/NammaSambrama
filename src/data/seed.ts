import { uid } from '@/lib/id'
import type { Dish, EventType, FoodCategory, Line } from '@/types'

const line = (text: string): Line => ({ id: uid(), text })
const lines = (arr: string[]): Line[] => arr.map(line)

export const SEED_EVENTS: EventType[] = [
  {
    id: uid(),
    eventType: 'Wedding',
    eventTitle: 'Traditional Muhurtha Wedding',
    eventDescription:
      'A morning ceremony rooted in ritual, dressed in silk and jasmine.',
    eventIcon: 'rings',
    eventImage: '',
    eventVideo: 'https://youtu.be/aqz-KE-bpKQ',
    foodMenu: lines([
      'Banana-leaf sit-down feast',
      'Filter coffee & payasa counter',
      'Live obbattu station',
    ]),
    eventDesign: lines([
      'Silk-and-jasmine mandap',
      'Brass diya trail along the aisle',
      'Banana-stem entrance pillars',
    ]),
  },
  {
    id: uid(),
    eventType: 'Wedding',
    eventTitle: 'Reception Night',
    eventDescription:
      'The evening celebration — brighter lights and a wider spread.',
    eventIcon: 'music',
    eventImage: '',
    eventVideo: 'https://youtu.be/dQw4w9WgXcQ',
    foodMenu: lines([
      'Multi-cuisine dinner buffet',
      'Live chaat & pani-puri counter',
      'Dessert wall with kulfi bar',
    ]),
    eventDesign: lines([
      'Floral backdrop with fairy lights',
      'Monogrammed couple stage',
      'Draped ceiling canopy',
    ]),
  },
  {
    id: uid(),
    eventType: 'Engagement',
    eventTitle: 'Ring Ceremony',
    eventDescription: 'An intimate stage moment, framed in blush and gold.',
    eventIcon: 'ring',
    eventImage: '',
    eventVideo: '',
    foodMenu: lines([
      'Live chaat counter',
      'Mocktail welcome bar',
      'Ring-platter dessert display',
    ]),
    eventDesign: lines([
      'Rose-gold stage backdrop',
      'Floral ring arch',
      'Fairy-light drape ceiling',
    ]),
  },
  {
    id: uid(),
    eventType: 'Birthday',
    eventTitle: "Kids' Birthday",
    eventDescription:
      'Loud colours, small plates, a party built at kid height.',
    eventIcon: 'cake',
    eventImage: '',
    eventVideo: '',
    foodMenu: lines([
      'Mini sliders & fries counter',
      'Candy floss & popcorn cart',
      'Theme-matched cake table',
    ]),
    eventDesign: lines([
      'Balloon arch in theme colours',
      'Character cutout backdrop',
      'Photo-booth corner with props',
    ]),
  },
  {
    id: uid(),
    eventType: 'Baby Shower',
    eventTitle: 'Godh Bharai Celebration',
    eventDescription:
      'A soft, joyful welcome for the newest member of the family.',
    eventIcon: 'baby',
    eventImage: '',
    eventVideo: '',
    foodMenu: lines([
      'Milk-sweet counter',
      'Fruit mocktail station',
      'Themed cupcake tower',
    ]),
    eventDesign: lines([
      'Pastel balloon garland',
      'Cloud & stork backdrop',
      'Welcome banner with fairy lights',
    ]),
  },
  {
    id: uid(),
    eventType: 'Corporate',
    eventTitle: 'Product Launch',
    eventDescription:
      'Sharp, brand-first, built for a room full of first impressions.',
    eventIcon: 'briefcase',
    eventImage: '',
    eventVideo: '',
    foodMenu: lines([
      'Standing canapés service',
      'Mocktail & espresso bar',
      'Branded dessert bites',
    ]),
    eventDesign: lines([
      'LED backdrop in brand colours',
      'Spotlight reveal stage',
      'Minimal lounge seating pods',
    ]),
  },
]

const dish = (name: string, isVeg: boolean, description: string): Dish => ({
  id: uid(),
  dishName: name,
  isVeg,
  dishImage: '',
  dishDescription: description,
})

export const SEED_FOODS: FoodCategory[] = [
  {
    id: uid(),
    foodType: 'North Indian',
    foodtypeimage: '',
    dishlist: [
      dish('Paneer Butter Masala', true, 'Cottage cheese in a silky tomato-cashew gravy'),
      dish('Dal Makhani', true, 'Black lentils, slow-simmered overnight'),
      dish('Amritsari Kulcha', true, 'Stuffed tandoor bread with butter'),
      dish('Butter Chicken', false, 'Tandoori chicken in a mild makhani sauce'),
      dish('Rogan Josh', false, 'Kashmiri mutton curry with fennel'),
    ],
  },
  {
    id: uid(),
    foodType: 'South Indian',
    foodtypeimage: '',
    dishlist: [
      dish('Masala Dosa', true, 'Crisp dosa, potato masala, three chutneys'),
      dish('Bisi Bele Bath', true, 'Karnataka rice-lentil classic'),
      dish('Mysore Pak', true, 'Ghee-rich gram flour sweet'),
      dish('Obbattu / Holige', true, 'Jaggery-stuffed sweet flatbread, festival staple'),
      dish('Payasa', true, 'Ghee, jaggery and vermicelli, served warm'),
      dish('Akki Rotti', true, 'Rice-flour rotti with kara chutney'),
      dish('Hyderabadi Chicken Biryani', false, 'Dum-cooked, served with mirchi ka salan'),
    ],
  },
  {
    id: uid(),
    foodType: 'Chinese',
    foodtypeimage: '',
    dishlist: [
      dish('Veg Manchurian', true, 'Fried vegetable balls in garlic sauce'),
      dish('Hakka Noodles', true, 'Wok-tossed with julienned vegetables'),
      dish('Chilli Chicken', false, 'Dry, hot and sweet'),
      dish('Chicken Fried Rice', false, 'Egg and spring onion'),
    ],
  },
  {
    id: uid(),
    foodType: 'Starters & Live Counters',
    foodtypeimage: '',
    dishlist: [
      dish('Paneer Tikka', true, 'Charred in the tandoor, mint chutney'),
      dish('Live Chaat Counter', true, 'Pani-puri, sev-puri, dahi-puri'),
      dish('Chicken 65', false, 'Curry-leaf tempered, Chennai style'),
      dish('Live Grill & BBQ', false, 'Chef-manned, four marinades'),
    ],
  },
]

export const emptyEvent = (): EventType => ({
  id: '',
  eventType: '',
  eventTitle: '',
  eventDescription: '',
  eventIcon: '',
  eventImage: '',
  eventVideo: '',
  foodMenu: [line('')],
  eventDesign: [line('')],
})

export const emptyFood = (): FoodCategory => ({
  id: '',
  foodType: '',
  foodtypeimage: '',
  dishlist: [dish('', true, '')],
})
