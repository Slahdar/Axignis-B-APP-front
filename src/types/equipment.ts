export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: any;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  roles?: Role[];
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: number;
  name: string;
  description?: string;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: number;
  name: string;
  description?: string;
  domain_id: number;
  domain?: Domain;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentType {
  id: number;
  title: string;
  subtitle?: string;
  family_id: number;
  family?: Family;
  inventory_required?: boolean;
  additional_fields?: Record<string, any>;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: number;
  name: string;
  description?: string;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  reference?: string;
  description?: string;
  brand_id: number;
  brand?: Brand;
  equipment_type_id: number;
  equipment_type?: EquipmentType;
  status?: 'active' | 'inactive' | 'maintenance';
  associated_products?: Product[];
  documents?: Document[];
  inventories?: Inventory[];
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  brand_id: number;
  equipment_type_id: number;
  document_ids?: number[];
}

export interface CreateDocumentData {
  name: string;
  document_type_id: number;
  file: File;
  issue_date: string;
  expiry_date?: string;
  version: string;
  reference: string;
  product_ids?: number[];
}

export interface CreateDomainData {
  name: string;
}

export interface CreateFamilyData {
  name: string;
  domain_id: number;
}

export interface CreateEquipmentTypeData {
  title: string;
  subtitle?: string;
  family_id: number;
  inventory_required?: boolean;
  additional_fields?: Record<string, any>;
}

export interface CreateBrandData {
  name: string;
}

export interface CreateDocumentTypeData {
  name: string;
}

export interface CreateInventoryData {
  product_id: number;
  location: string;
  brand_id?: number;
  commissioning_date?: string;
  additional_fields?: Record<string, any>;
}

export interface Document {
  id: number;
  name: string;
  file_name?: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  document_type_id: number;
  document_type?: DocumentType;
  version: string;
  issue_date: string;
  expiry_date?: string;
  reference: string;
  archived: boolean;
  serial_number: string;
  created_at: string;
  updated_at: string;
  products?: Product[];
}

export interface Inventory {
  id: number;
  product_id: number;
  product?: Product;
  quantity?: number;
  location: string;
  brand_id?: number;
  brand?: Brand;
  commissioning_date?: string;
  additional_fields?: Record<string, any>;
  notes?: string;
  last_updated?: string;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}