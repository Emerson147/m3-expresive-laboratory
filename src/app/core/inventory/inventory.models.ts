export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'central' | 'store';
  location: string;
}

export interface ProductColor {
  code: string;
  name: string;
  hex: string;
  border?: string;
}

export interface StockCell {
  variantSku: string;
  size: string;
  colorCode: string;
  stock: number;
  minThreshold: number;
  reserved: number;
  warehouseId: string;
}

export interface MasterProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  categoryLabel: string;
  brand: string;
  season: string;
  basePrice: number;
  imageUrl: string;
  availableSizes: string[];
  availableColors: ProductColor[];
  cells: StockCell[];
}

export interface StockTransfer {
  id: string;
  date: Date;
  productId: number;
  productName: string;
  variantSku: string;
  size: string;
  colorName: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  operator: string;
}

export type StockStatus = 'healthy' | 'low' | 'out_of_stock';

export interface MatrixCellView {
  variantSku: string;
  size: string;
  colorCode: string;
  stock: number;
  reserved: number;
  minThreshold: number;
  status: StockStatus;
  warehouseId: string;
}

export interface MatrixRowView {
  color: ProductColor;
  cells: MatrixCellView[];
  totalStock: number;
  totalReserved: number;
}

export interface MatrixColumnSummary {
  size: string;
  totalStock: number;
  totalReserved: number;
}

export interface InventoryKpiSummary {
  totalSkus: number;
  totalUnits: number;
  totalCatalogValue: number;
  lowStockSkus: number;
  outOfStockSkus: number;
  healthRate: number;
}

export interface CreateMasterProductDto {
  name: string;
  sku: string;
  category: string;
  categoryLabel: string;
  brand: string;
  season: string;
  basePrice: number;
  imageUrl?: string;
  sizes: string[];
  colors: ProductColor[];
  initialStockPerCell: number;
  targetWarehouseId: string;
}

export const STANDARD_COLORS: ProductColor[] = [
  { code: 'BLK', name: 'Negro Azabache', hex: '#18181B' },
  { code: 'WHT', name: 'Blanco Óptico', hex: '#FFFFFF', border: '#CBD5E1' },
  { code: 'NVY', name: 'Azul Marino', hex: '#1B2A4A' },
  { code: 'GRY', name: 'Gris Marengo', hex: '#64748B' },
  { code: 'BEI', name: 'Arena / Beige', hex: '#D6D3D1' },
  { code: 'OLV', name: 'Verde Militar', hex: '#3F4F3D' },
  { code: 'BUR', name: 'Borgoña Vino', hex: '#5B1D28' },
  { code: 'TER', name: 'Terracota Cálido', hex: '#9A3412' },
  { code: 'SKY', name: 'Celeste Pima', hex: '#93C5FD' }
];

export const SIZE_PRESETS = [
  { id: 'alpha', label: 'Textil Estándar (XS-XXL)', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'alpha_compact', label: 'Básico (S-XL)', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'pants', label: 'Pantalones Numéricos (28-38)', sizes: ['28', '30', '32', '34', '36', '38'] },
  { id: 'shoes', label: 'Calzado Europeo (39-44)', sizes: ['39', '40', '41', '42', '43', '44'] },
  { id: 'tailoring', label: 'Sastrería Trajes (38R-44R)', sizes: ['38R', '40R', '42R', '44R'] }
];
