import type { FoodCategory, Line } from '@/types'

export function preselectedDishIds(foodMenu: Line[], foods: FoodCategory[]): string[] {
  const menuText = foodMenu.map((l) => l.text.toLowerCase())
  const ids: string[] = []
  foods.forEach((cat) => {
    cat.dishlist.forEach((d) => {
      const name = d.dishName.toLowerCase()
      if (!name) return
      const matched = menuText.some((line) => line.includes(name) || name.includes(line))
      if (matched) ids.push(d.id)
    })
  })
  return ids
}
