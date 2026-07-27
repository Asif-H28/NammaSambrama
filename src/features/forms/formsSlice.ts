import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { uid } from '@/lib/id'
import { emptyEvent, emptyFood } from '@/data/seed'
import type { Dish, EventType, FoodCategory, IconKey } from '@/types'

interface FormsState {
  event: EventType
  food: FoodCategory
}

const initialState: FormsState = {
  event: emptyEvent(),
  food: emptyFood(),
}

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    startEvent(state, action: PayloadAction<EventType | undefined>) {
      state.event = action.payload ? structuredClone(action.payload) : emptyEvent()
    },
    startFood(state, action: PayloadAction<FoodCategory | undefined>) {
      state.food = action.payload ? structuredClone(action.payload) : emptyFood()
    },
    patchEvent(state, action: PayloadAction<Partial<EventType>>) {
      Object.assign(state.event, action.payload)
    },
    setEventIcon(state, action: PayloadAction<IconKey>) {
      state.event.eventIcon = action.payload
    },
    addFoodLine(state) {
      state.event.foodMenu.push({ id: uid(), text: '' })
    },
    changeFoodLine(state, action: PayloadAction<{ id: string; text: string }>) {
      const l = state.event.foodMenu.find((x) => x.id === action.payload.id)
      if (l) l.text = action.payload.text
    },
    removeFoodLine(state, action: PayloadAction<string>) {
      state.event.foodMenu = state.event.foodMenu.filter((x) => x.id !== action.payload)
    },
    addDesignLine(state) {
      state.event.eventDesign.push({ id: uid(), text: '' })
    },
    changeDesignLine(state, action: PayloadAction<{ id: string; text: string }>) {
      const l = state.event.eventDesign.find((x) => x.id === action.payload.id)
      if (l) l.text = action.payload.text
    },
    removeDesignLine(state, action: PayloadAction<string>) {
      state.event.eventDesign = state.event.eventDesign.filter((x) => x.id !== action.payload)
    },

    patchFood(state, action: PayloadAction<Partial<FoodCategory>>) {
      Object.assign(state.food, action.payload)
    },
    addDish(state) {
      state.food.dishlist.push({ id: uid(), dishName: '', isVeg: true, dishImage: '', dishDescription: '' })
    },
    patchDish(state, action: PayloadAction<{ id: string; patch: Partial<Dish> }>) {
      const d = state.food.dishlist.find((x) => x.id === action.payload.id)
      if (d) Object.assign(d, action.payload.patch)
    },
    removeDish(state, action: PayloadAction<string>) {
      state.food.dishlist = state.food.dishlist.filter((x) => x.id !== action.payload)
    },
  },
})

export const {
  startEvent,
  startFood,
  patchEvent,
  setEventIcon,
  addFoodLine,
  changeFoodLine,
  removeFoodLine,
  addDesignLine,
  changeDesignLine,
  removeDesignLine,
  patchFood,
  addDish,
  patchDish,
  removeDish,
} = formsSlice.actions
export default formsSlice.reducer
