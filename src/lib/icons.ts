import { Car, Bus, UtensilsCrossed, ShoppingBasket, Stethoscope, BedDouble, Compass, Users, Building2, Landmark, Siren, type LucideIcon } from "lucide-react";

// One line-icon set (Lucide) for every situation.
export const situationIcons: Record<string, LucideIcon> = {
  car: Car, bus: Bus, food: UtensilsCrossed, market: ShoppingBasket, health: Stethoscope,
  stay: BedDouble, directions: Compass, neighbours: Users, office: Building2, bank: Landmark, emergency: Siren,
};
