export interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

export const AVAILABLE_PERMISSIONS: Permission[] = [
  // Domains
  { id: 1, name: "view domains", description: "Voir la liste et les détails des domaines", category: "Domaines" },
  { id: 2, name: "create domains", description: "Créer de nouveaux domaines", category: "Domaines" },
  { id: 3, name: "edit domains", description: "Mettre à jour les domaines existants", category: "Domaines" },
  { id: 4, name: "delete domains", description: "Supprimer des domaines", category: "Domaines" },

  // Families
  { id: 5, name: "view families", description: "Voir la liste et les détails des familles", category: "Familles" },
  { id: 6, name: "create families", description: "Créer de nouvelles familles", category: "Familles" },
  { id: 7, name: "edit families", description: "Mettre à jour les familles existantes", category: "Familles" },
  { id: 8, name: "delete families", description: "Supprimer des familles", category: "Familles" },

  // Equipment Types
  { id: 9, name: "view equipment_types", description: "Voir la liste et les détails des types d'équipements", category: "Types d'équipements" },
  { id: 10, name: "create equipment_types", description: "Créer de nouveaux types d'équipements", category: "Types d'équipements" },
  { id: 11, name: "edit equipment_types", description: "Mettre à jour les types d'équipements existants", category: "Types d'équipements" },
  { id: 12, name: "delete equipment_types", description: "Supprimer des types d'équipements", category: "Types d'équipements" },

  // Brands
  { id: 13, name: "view brands", description: "Voir la liste et les détails des marques", category: "Marques" },
  { id: 14, name: "create brands", description: "Créer de nouvelles marques", category: "Marques" },
  { id: 15, name: "edit brands", description: "Mettre à jour les marques existantes", category: "Marques" },
  { id: 16, name: "delete brands", description: "Supprimer des marques", category: "Marques" },

  // Document Types
  { id: 17, name: "view document_types", description: "Voir la liste et les détails des types de documents", category: "Types de documents" },
  { id: 18, name: "create document_types", description: "Créer de nouveaux types de documents", category: "Types de documents" },
  { id: 19, name: "edit document_types", description: "Mettre à jour les types de documents existants", category: "Types de documents" },
  { id: 20, name: "delete document_types", description: "Supprimer des types de documents", category: "Types de documents" },

  // Documents
  { id: 21, name: "view documents", description: "Voir la liste et les détails des documents", category: "Documents" },
  { id: 22, name: "create documents", description: "Créer de nouveaux documents", category: "Documents" },
  { id: 23, name: "edit documents", description: "Mettre à jour les documents existants", category: "Documents" },
  { id: 24, name: "delete documents", description: "Supprimer des documents", category: "Documents" },
  { id: 25, name: "archive documents", description: "Archiver/désarchiver des documents", category: "Documents" },

  // Products
  { id: 26, name: "view products", description: "Voir la liste et les détails des produits", category: "Produits" },
  { id: 27, name: "create products", description: "Créer de nouveaux produits", category: "Produits" },
  { id: 28, name: "edit products", description: "Mettre à jour les produits existants", category: "Produits" },
  { id: 29, name: "delete products", description: "Supprimer des produits", category: "Produits" },
  { id: 30, name: "associate products", description: "Associer/dissocier des produits", category: "Produits" },

  // Inventories
  { id: 31, name: "view inventories", description: "Voir la liste et les détails des inventaires", category: "Inventaires" },
  { id: 32, name: "create inventories", description: "Créer de nouveaux inventaires", category: "Inventaires" },
  { id: 33, name: "edit inventories", description: "Mettre à jour les inventaires existants", category: "Inventaires" },
  { id: 34, name: "delete inventories", description: "Supprimer des inventaires", category: "Inventaires" },

  // Users
  { id: 35, name: "view users", description: "Voir la liste et les détails des utilisateurs", category: "Utilisateurs" },
  { id: 36, name: "create users", description: "Créer de nouveaux utilisateurs", category: "Utilisateurs" },
  { id: 37, name: "edit users", description: "Mettre à jour les utilisateurs existants", category: "Utilisateurs" },
  { id: 38, name: "delete users", description: "Supprimer des utilisateurs", category: "Utilisateurs" },
  { id: 39, name: "manage permissions", description: "Attribuer/retirer des rôles et des permissions", category: "Utilisateurs" },
];

export const getPermissionsByCategory = () => {
  const categories: { [key: string]: Permission[] } = {};
  
  AVAILABLE_PERMISSIONS.forEach(permission => {
    if (!categories[permission.category]) {
      categories[permission.category] = [];
    }
    categories[permission.category].push(permission);
  });
  
  return categories;
};