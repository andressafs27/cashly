import { Category } from '@/types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food',          name: 'Alimentação',   color: '#FF6B6B', icon: 'UtensilsCrossed', isDefault: true },
  { id: 'transport',     name: 'Transporte',    color: '#4ECDC4', icon: 'Car',             isDefault: true },
  { id: 'health',        name: 'Saúde',         color: '#45B7D1', icon: 'Heart',           isDefault: true },
  { id: 'education',     name: 'Educação',      color: '#96CEB4', icon: 'GraduationCap',   isDefault: true },
  { id: 'leisure',       name: 'Lazer',         color: '#FFEAA7', icon: 'Gamepad2',        isDefault: true },
  { id: 'shopping',      name: 'Compras',       color: '#DDA0DD', icon: 'ShoppingBag',     isDefault: true },
  { id: 'housing',       name: 'Moradia',       color: '#98D8C8', icon: 'Home',            isDefault: true },
  { id: 'streaming',     name: 'Streaming',     color: '#F7DC6F', icon: 'Tv',              isDefault: true },
  { id: 'salary',        name: 'Salário',       color: '#00C48C', icon: 'Wallet',          isDefault: true },
  { id: 'freelance',     name: 'Freelance',     color: '#1B4FDE', icon: 'Briefcase',       isDefault: true },
  { id: 'other_expense', name: 'Outros',        color: '#BDC3C7', icon: 'MoreHorizontal',  isDefault: true },
  { id: 'other_income',  name: 'Outras Rendas', color: '#A8E6CF', icon: 'Plus',            isDefault: true },
]