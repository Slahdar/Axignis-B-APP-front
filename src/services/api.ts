import { 
  Product, 
  CreateProductData,
  CreateDocumentData,
  CreateDomainData,
  CreateFamilyData,
  CreateEquipmentTypeData,
  CreateBrandData,
  CreateDocumentTypeData,
  CreateInventoryData,
  Brand, 
  EquipmentType, 
  Document, 
  Domain,
  Family,
  DocumentType,
  Inventory,
  ApiResponse, 
  PaginatedResponse,
  User,
  Permission
} from '@/types/equipment';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        user: User;
        token: string;
        permissions: string[];
        roles: string[];
      };
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.data.token;
    localStorage.setItem('token', response.data.token);
    return response;
  }

  async register(name: string, email: string, password: string, password_confirmation: string) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        user: User;
        token: string;
        permissions: string[];
        roles: string[];
      };
    }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    
    this.token = response.data.token;
    localStorage.setItem('token', response.data.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('token');
    }
  }

  async getUser(): Promise<User> {
    return this.request<User>('/user');
  }

  // Domains
  async getDomains(): Promise<ApiResponse<Domain[]>> {
    return this.request<ApiResponse<Domain[]>>('/domains');
  }

  async getDomain(id: number): Promise<ApiResponse<Domain>> {
    return this.request<ApiResponse<Domain>>(`/domains/${id}`);
  }

  async createDomain(domain: CreateDomainData): Promise<ApiResponse<Domain>> {
    return this.request<ApiResponse<Domain>>('/domains', {
      method: 'POST',
      body: JSON.stringify(domain),
    });
  }

  async updateDomain(id: number, domain: Partial<Domain>): Promise<ApiResponse<Domain>> {
    return this.request<ApiResponse<Domain>>(`/domains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(domain),
    });
  }

  async deleteDomain(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/domains/${id}`, {
      method: 'DELETE',
    });
  }

  // Families
  async getFamilies(): Promise<ApiResponse<Family[]>> {
    return this.request<ApiResponse<Family[]>>('/families');
  }

  async getFamiliesByDomain(domainId: number): Promise<ApiResponse<Family[]>> {
    return this.request<ApiResponse<Family[]>>(`/domains/${domainId}/families`);
  }

  async getFamily(id: number): Promise<ApiResponse<Family>> {
    return this.request<ApiResponse<Family>>(`/families/${id}`);
  }

  async createFamily(family: CreateFamilyData): Promise<ApiResponse<Family>> {
    return this.request<ApiResponse<Family>>('/families', {
      method: 'POST',
      body: JSON.stringify(family),
    });
  }

  async updateFamily(id: number, family: Partial<Family>): Promise<ApiResponse<Family>> {
    return this.request<ApiResponse<Family>>(`/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(family),
    });
  }

  async deleteFamily(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/families/${id}`, {
      method: 'DELETE',
    });
  }

  // Equipment Types
  async getEquipmentTypes(): Promise<ApiResponse<EquipmentType[]>> {
    return this.request<ApiResponse<EquipmentType[]>>('/equipment-types');
  }

  async getEquipmentTypesByFamily(familyId: number): Promise<ApiResponse<EquipmentType[]>> {
    return this.request<ApiResponse<EquipmentType[]>>(`/families/${familyId}/equipment-types`);
  }

  async getEquipmentType(id: number): Promise<ApiResponse<EquipmentType>> {
    return this.request<ApiResponse<EquipmentType>>(`/equipment-types/${id}`);
  }

  async createEquipmentType(type: CreateEquipmentTypeData): Promise<ApiResponse<EquipmentType>> {
    return this.request<ApiResponse<EquipmentType>>('/equipment-types', {
      method: 'POST',
      body: JSON.stringify(type),
    });
  }

  async updateEquipmentType(id: number, type: Partial<EquipmentType>): Promise<ApiResponse<EquipmentType>> {
    return this.request<ApiResponse<EquipmentType>>(`/equipment-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(type),
    });
  }

  async deleteEquipmentType(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/equipment-types/${id}`, {
      method: 'DELETE',
    });
  }

  // Brands
  async getBrands(): Promise<ApiResponse<Brand[]>> {
    return this.request<ApiResponse<Brand[]>>('/brands');
  }

  async getBrand(id: number): Promise<ApiResponse<Brand>> {
    return this.request<ApiResponse<Brand>>(`/brands/${id}`);
  }

  async createBrand(brand: CreateBrandData): Promise<ApiResponse<Brand>> {
    return this.request<ApiResponse<Brand>>('/brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    });
  }

  async updateBrand(id: number, brand: Partial<Brand>): Promise<ApiResponse<Brand>> {
    return this.request<ApiResponse<Brand>>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brand),
    });
  }

  async deleteBrand(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/brands/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    return this.request<PaginatedResponse<Product>>(`/products?${searchParams}`);
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/products/${id}`);
  }

  async getProductsByBrand(brandId: number): Promise<ApiResponse<Product[]>> {
    return this.request<ApiResponse<Product[]>>(`/brands/${brandId}/products`);
  }

  async getProductsByEquipmentType(equipmentTypeId: number): Promise<ApiResponse<Product[]>> {
    return this.request<ApiResponse<Product[]>>(`/equipment-types/${equipmentTypeId}/products`);
  }

  async getAssociatedProducts(productId: number): Promise<ApiResponse<Product[]>> {
    return this.request<ApiResponse<Product[]>>(`/products/${productId}/associated-products`);
  }

  async createProduct(product: CreateProductData): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async associateProduct(productId: number, associatedProductId: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/products/${productId}/associate`, {
      method: 'POST',
      body: JSON.stringify({ associated_product_id: associatedProductId }),
    });
  }

  async dissociateProduct(productId: number, associatedProductId: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/products/${productId}/dissociate/${associatedProductId}`, {
      method: 'DELETE',
    });
  }

  // Document Types
  async getDocumentTypes(): Promise<ApiResponse<DocumentType[]>> {
    return this.request<ApiResponse<DocumentType[]>>('/document-types');
  }

  async getDocumentType(id: number): Promise<ApiResponse<DocumentType>> {
    return this.request<ApiResponse<DocumentType>>(`/document-types/${id}`);
  }

  async createDocumentType(type: CreateDocumentTypeData): Promise<ApiResponse<DocumentType>> {
    return this.request<ApiResponse<DocumentType>>('/document-types', {
      method: 'POST',
      body: JSON.stringify(type),
    });
  }

  async updateDocumentType(id: number, type: Partial<DocumentType>): Promise<ApiResponse<DocumentType>> {
    return this.request<ApiResponse<DocumentType>>(`/document-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(type),
    });
  }

  async deleteDocumentType(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/document-types/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async getDocuments(): Promise<ApiResponse<Document[]>> {
    return this.request<ApiResponse<Document[]>>('/documents?with=products');
  }

  async getDocument(id: number): Promise<ApiResponse<Document>> {
    return this.request<ApiResponse<Document>>(`/documents/${id}`);
  }

  async getDocumentsByProduct(productId: number): Promise<ApiResponse<Document[]>> {
    return this.request<ApiResponse<Document[]>>(`/products/${productId}/documents`);
  }

  async createDocument(formData: FormData): Promise<ApiResponse<Document>> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async updateDocument(id: number, formData: FormData): Promise<ApiResponse<Document>> {
    // Laravel requires _method override for multipart PUT requests
    formData.append('_method', 'PUT');
    
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async archiveDocument(id: number): Promise<ApiResponse<Document>> {
    return this.request<ApiResponse<Document>>(`/documents/${id}/archive`, {
      method: 'PATCH',
    });
  }

  async deleteDocument(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(id: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }

  async attachDocumentToProduct(productId: number, documentId: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/products/${productId}/documents/${documentId}`, {
      method: 'POST',
    });
  }

  async detachDocumentFromProduct(productId: number, documentId: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/products/${productId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Inventories
  async getInventories(): Promise<ApiResponse<Inventory[]>> {
    return this.request<ApiResponse<Inventory[]>>('/inventories');
  }

  async getInventory(id: number): Promise<ApiResponse<Inventory>> {
    return this.request<ApiResponse<Inventory>>(`/inventories/${id}`);
  }

  async getInventoriesByProduct(productId: number): Promise<ApiResponse<Inventory[]>> {
    return this.request<ApiResponse<Inventory[]>>(`/products/${productId}/inventories`);
  }

  async createInventory(inventory: CreateInventoryData): Promise<ApiResponse<Inventory>> {
    return this.request<ApiResponse<Inventory>>('/inventories', {
      method: 'POST',
      body: JSON.stringify(inventory),
    });
  }

  async updateInventory(id: number, inventory: Partial<Inventory>): Promise<ApiResponse<Inventory>> {
    return this.request<ApiResponse<Inventory>>(`/inventories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inventory),
    });
  }

  async deleteInventory(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/inventories/${id}`, {
      method: 'DELETE',
    });
  }

  // Users (Admin only)
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>('/users');
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${id}`);
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async assignRoleToUser(userId: number, role: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/users/${userId}/assign-role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async removeRoleFromUser(userId: number, role: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/users/${userId}/remove-role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async assignPermissionToUser(userId: number, permission: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/users/${userId}/assign-permission`, {
      method: 'POST',
      body: JSON.stringify({ permission }),
    });
  }

  async removePermissionFromUser(userId: number, permission: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/users/${userId}/remove-permission`, {
      method: 'POST',
      body: JSON.stringify({ permission }),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }
}

export const apiService = new ApiService();