export type ThemeKey = 'blurple'
export type ThemeMode = 'light' | 'dark'
export type Layout = 'stacked' | 'split' | 'steps'
export type FormSection = 'basics' | 'media' | 'food' | 'design'
export type Screen =
  | 'dashboard'
  | 'events'
  | 'event-form'
  | 'foods'
  | 'food-form'
  | 'public'

export type IconKey =
  | 'rings'
  | 'cake'
  | 'ring'
  | 'baby'
  | 'briefcase'
  | 'grad'
  | 'music'
  | 'camera'
  | 'plant'

export interface Line {
  id: string
  text: string
}

export interface EventType {
  id: string
  eventType: string
  eventTitle: string
  eventDescription: string
  eventIcon: IconKey | ''
  eventImage: string
  eventVideo: string
  foodMenu: Line[]
  eventDesign: Line[]
}

export interface Dish {
  id: string
  dishName: string
  isVeg: boolean
  dishImage: string
  dishDescription: string
}

export interface FoodCategory {
  id: string
  foodType: string
  foodtypeimage: string
  dishlist: Dish[]
}

export interface BookingCustomItem {
  id: string
  categoryId: string
  name: string
}

export interface BookingState {
  step: 'type' | 'menu' | 'review'
  eventTypeId: string
  customEventName: string
  selectedDishIds: string[]
  customItems: BookingCustomItem[]
  contactName: string
  contactPhone: string
  contactNotes: string
}
