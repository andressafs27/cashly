import {
  // Finanças
  Wallet, Banknote, CreditCard, PiggyBank, Coins, Receipt,
  Calculator, DollarSign, TrendingUp, TrendingDown, BarChart2, Landmark,
  Building2, Store, Percent, ArrowUpDown,
  // Alimentação
  UtensilsCrossed, Coffee, Wine, Pizza, Apple, IceCream,
  ChefHat, Sandwich, Soup, Cookie, Beer, Salad, Milk, Carrot,
  // Transporte
  Car, Plane, Bus, Train, Bike, Fuel, Ship, Truck,
  // Saúde & Bem-estar
  Heart, Activity, Dumbbell, Stethoscope, Pill, Brain,
  Eye, Smile, Baby, Thermometer, Syringe, Ambulance, FlameKindling,
  // Casa
  Home, Sofa, Lamp, Wifi, Plug, Wrench, Key, Hammer, Lightbulb,
  Bed, Bath, Microwave, Armchair, PaintBucket,
  // Compras
  ShoppingBag, ShoppingCart, Gift, Tag, Package, Shirt,
  Watch, Gem, Glasses, Scissors, Backpack, Luggage,
  // Tecnologia
  Laptop, Phone, Monitor, Cpu, Keyboard, Headphones,
  Bluetooth, Battery, Code, Tablet, Printer, Server, HardDrive, Usb,
  // Educação
  GraduationCap, Book, BookOpen, Pen, Microscope,
  Compass, Globe, Map, Library, School, PenLine, Pencil,
  // Entretenimento
  Tv, Gamepad2, Music, Film, Camera, Trophy,
  Ticket, Dice5, Palette, Theater, Clapperboard, Radio, Headset,
  // Viagens & Natureza
  Tent, Mountain, Anchor, Leaf, TreePine, Sun, Moon,
  Flame, Snowflake, Cloud, Wind, Droplets, MapPin, Sunset, Sunrise,
  // Trabalho & Comunicação
  Briefcase, Building, Mail, FileText, Clock, Bell,
  MessageCircle, Calendar, Users, UserCircle,
  // Outros
  PawPrint, Star, Zap, Flower2, MoreHorizontal, Plus,
  Sparkles, Shield, Lock, Unlock, AlertCircle,
  type LucideIcon,
} from 'lucide-react'

export const ICON_GROUPS: { label: string; icons: Record<string, LucideIcon> }[] = [
  {
    label: 'Finanças',
    icons: {
      Wallet, Banknote, CreditCard, PiggyBank, Coins, Receipt,
      Calculator, DollarSign, TrendingUp, TrendingDown, BarChart2,
      Landmark, Building2, Store, Percent, ArrowUpDown,
    },
  },
  {
    label: 'Alimentação',
    icons: {
      UtensilsCrossed, Coffee, Wine, Pizza, Apple, IceCream,
      ChefHat, Sandwich, Soup, Cookie, Beer, Salad, Milk, Carrot,
    },
  },
  {
    label: 'Transporte',
    icons: { Car, Plane, Bus, Train, Bike, Fuel, Ship, Truck },
  },
  {
    label: 'Saúde & Bem-estar',
    icons: {
      Heart, Activity, Dumbbell, Stethoscope, Pill, Brain,
      Eye, Smile, Baby, Thermometer, Syringe, Ambulance, FlameKindling,
    },
  },
  {
    label: 'Casa',
    icons: {
      Home, Sofa, Lamp, Wifi, Plug, Wrench, Key, Hammer,
      Lightbulb, Bed, Bath, Microwave, Armchair, PaintBucket,
    },
  },
  {
    label: 'Compras',
    icons: {
      ShoppingBag, ShoppingCart, Gift, Tag, Package, Shirt,
      Watch, Gem, Glasses, Scissors, Backpack, Luggage,
    },
  },
  {
    label: 'Tecnologia',
    icons: {
      Laptop, Phone, Monitor, Cpu, Keyboard, Headphones,
      Bluetooth, Battery, Code, Tablet, Printer, Server, HardDrive, Usb,
    },
  },
  {
    label: 'Educação',
    icons: {
      GraduationCap, Book, BookOpen, Pen, PenLine, Pencil,
      Microscope, Compass, Globe, Map, Library, School,
    },
  },
  {
    label: 'Entretenimento',
    icons: {
      Tv, Gamepad2, Music, Film, Camera, Trophy,
      Ticket, Dice5, Palette, Theater, Clapperboard, Radio, Headset,
    },
  },
  {
    label: 'Viagens & Natureza',
    icons: {
      Tent, Mountain, Anchor, Leaf, TreePine, Sun, Moon,
      Flame, Snowflake, Cloud, Wind, Droplets, MapPin, Sunset, Sunrise,
    },
  },
  {
    label: 'Trabalho',
    icons: {
      Briefcase, Building, Mail, FileText, Clock, Bell,
      MessageCircle, Calendar, Users, UserCircle,
    },
  },
  {
    label: 'Outros',
    icons: {
      PawPrint, Star, Zap, Flower2, Sparkles, Shield,
      Lock, Unlock, AlertCircle, MoreHorizontal, Plus,
    },
  },
]

// Mapa flat para lookup por nome (usado em getCategoryIcon e no picker)
export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_GROUPS.flatMap(({ icons }) => Object.entries(icons))
)

export const AVAILABLE_ICONS = Object.keys(ICON_MAP)

export const AVAILABLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#F7DC6F', '#98D8C8',
  '#00C48C', '#1B4FDE', '#FF9500', '#8B5CF6',
  '#EF4444', '#F59E0B', '#10B981', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1',
]

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? MoreHorizontal
}
