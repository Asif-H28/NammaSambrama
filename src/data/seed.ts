import { uid } from '@/lib/id'
import type { Dish, Enquiry, EventType, FoodCategory, Line } from '@/types'

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

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const NOW = new Date('2026-07-28T18:00:00').getTime()

export const SEED_ENQUIRIES: Enquiry[] = [
  {
    id: uid(),
    createdAt: NOW - 2 * HOUR,
    eventLabel: 'Wedding',
    isCustomEvent: false,
    items: [
      { name: 'Banana-leaf sit-down feast', isCustom: false },
      { name: 'Masala Dosa', isCustom: false },
      { name: 'Payasa', isCustom: false },
      { name: 'Live Chaat Counter', isCustom: false },
    ],
    contactName: 'Ramesh Gowda',
    contactPhone: '98450 11223',
    guestCount: '350',
    eventDate: '2026-08-15',
    eventTime: '10:00',
    contactNotes: 'Looking for a December weekend, outdoor mandap setup.',
    status: 'new',
  },
  {
    id: uid(),
    createdAt: NOW - 7 * HOUR,
    eventLabel: 'Birthday',
    isCustomEvent: false,
    items: [
      { name: 'Chicken Fried Rice', isCustom: false },
      { name: 'Veg Manchurian', isCustom: false },
      { name: 'Live Grill & BBQ', isCustom: false },
      { name: 'Chocolate fountain', isCustom: true },
    ],
    contactName: 'Anitha Shetty',
    contactPhone: '99001 44556',
    guestCount: '60',
    eventDate: '2026-08-02',
    eventTime: '17:30',
    contactNotes: "Kid's birthday, need a cartoon theme decorator too.",
    status: 'contacted',
  },
  {
    id: uid(),
    createdAt: NOW - DAY,
    eventLabel: 'Engagement',
    isCustomEvent: false,
    items: [
      { name: 'Paneer Tikka', isCustom: false },
      { name: 'Hyderabadi Chicken Biryani', isCustom: false },
      { name: 'Mysore Pak', isCustom: false },
    ],
    contactName: 'Divya & Karthik',
    contactPhone: '90080 33221',
    guestCount: '120',
    eventDate: '2026-08-15',
    eventTime: '19:00',
    contactNotes: '',
    status: 'new',
  },
  {
    id: uid(),
    createdAt: NOW - 1.5 * DAY,
    eventLabel: 'Corporate',
    isCustomEvent: false,
    items: [
      { name: 'Dal Makhani', isCustom: false },
      { name: 'Amritsari Kulcha', isCustom: false },
      { name: 'Live Chaat Counter', isCustom: false },
    ],
    contactName: 'Suresh Kumar, Infotech Park',
    contactPhone: '97401 22110',
    guestCount: '200',
    eventDate: '2026-08-22',
    eventTime: '11:00',
    contactNotes: 'Annual day event, need AV setup and stage.',
    status: 'closed',
  },
  {
    id: uid(),
    createdAt: NOW - 2 * DAY,
    eventLabel: 'Baby Shower',
    isCustomEvent: false,
    items: [
      { name: 'Bisi Bele Bath', isCustom: false },
      { name: 'Obbattu / Holige', isCustom: false },
    ],
    contactName: 'Priya Rao',
    contactPhone: '96110 88997',
    guestCount: '45',
    eventDate: '2026-08-09',
    eventTime: '09:30',
    contactNotes: 'Pastel theme, morning event.',
    status: 'contacted',
  },
  {
    id: uid(),
    createdAt: NOW - 3 * DAY,
    eventLabel: 'Wedding',
    isCustomEvent: false,
    items: [
      { name: 'Rogan Josh', isCustom: false },
      { name: 'Butter Chicken', isCustom: false },
      { name: 'Chilli Chicken', isCustom: false },
      { name: 'Live Grill & BBQ', isCustom: false },
    ],
    contactName: 'Nikhil & Sowmya',
    contactPhone: '95350 76421',
    guestCount: '500',
    eventDate: '2026-08-16',
    eventTime: '20:00',
    contactNotes: 'Reception night, need a bigger dinner spread.',
    status: 'new',
  },
  {
    id: uid(),
    createdAt: NOW - 4 * DAY,
    eventLabel: 'Housewarming',
    isCustomEvent: true,
    items: [
      { name: 'Akki Rotti', isCustom: false },
      { name: 'Payasa', isCustom: false },
    ],
    contactName: 'Manjunath H R',
    contactPhone: '94480 55667',
    guestCount: '80',
    eventDate: '2026-09-05',
    eventTime: '08:00',
    contactNotes: 'Griha pravesham, need pooja arrangements too.',
    status: 'closed',
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
