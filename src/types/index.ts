/** The console ships a single dark theme. */
export type ThemeKey = 'obsidian'
export type ThemeMode = 'light' | 'dark'
/** The event form ships a single split layout. */
export type Layout = 'split'
export type FormSection = 'basics' | 'media' | 'food' | 'design'
export type Screen =
  | 'dashboard'
  | 'events'
  | 'event-form'
  | 'foods'
  | 'food-form'
  | 'payment'
  | 'gallery'
  | 'settings'
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
  /** Azure Blob URL */
  eventImage: string
  /** Azure Blob path, used for cleanup on delete */
  eventImageId?: string
  eventVideo: string
  foodMenu: Line[]
  eventDesign: Line[]
}

export interface Dish {
  id: string
  dishName: string
  isVeg: boolean
  /** Azure Blob URL */
  dishImage: string
  /** Azure Blob path, used for cleanup on delete */
  dishImageId?: string
  dishDescription: string
}

export interface FoodCategory {
  id: string
  foodType: string
  /** Azure Blob URL */
  foodtypeimage: string
  /** Azure Blob path, used for cleanup on delete */
  foodtypeimageId?: string
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
  guestCount: string
  eventDate: string
  eventTime: string
  contactNotes: string
}

export interface EnquiryItem {
  name: string
  isCustom: boolean
}

export interface Enquiry {
  id: string
  createdAt: number
  eventLabel: string
  isCustomEvent: boolean
  items: EnquiryItem[]
  contactName: string
  contactPhone: string
  guestCount: string
  eventDate: string
  eventTime: string
  contactNotes: string
  status: 'new' | 'contacted' | 'closed'
}

export interface PaymentSettings {
  upiId: string
  qrImageUrl: string
  qrImageId?: string
  payeeName: string
}

export interface GalleryItem {
  id: string
  type: 'photo' | 'video'
  title: string
  description?: string
  imageUrl?: string
  imageId?: string
  youtubeUrl?: string
  youtubeId?: string
  eventType?: string
  showInPublic: boolean
  createdAt?: string
}

export interface GalleryData {
  enableGallery: boolean
  items: GalleryItem[]
}

