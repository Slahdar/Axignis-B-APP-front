import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { Inventory, Product, Brand } from "@/types/equipment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function InventoryPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [formData, setFormData] = useState({
    product_id: "",
    location: "",
    brand_id: "",
    commissioning_date: "",
    notes: "",
    additional_fields: [
      { key: "", value: "" }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoriesRes, productsRes, brandsRes] = await Promise.all([
        apiService.getInventories(),
        apiService.getProducts(),
        apiService.getBrands()
      ]);
      
      if (inventoriesRes.success) setInventories(inventoriesRes.data);
      if (productsRes.data) {
        const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data as any).data;
        setProducts(productsData || []);
      }
      if (brandsRes.success) setBrands(brandsRes.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert additional_fields array to object
      const additionalFieldsObj: Record<string, any> = {};
      formData.additional_fields.forEach(field => {
        if (field.key && field.value) {
          additionalFieldsObj[field.key] = field.value;
        }
      });

      const inventoryData = {
        product_id: parseInt(formData.product_id),
        brand_id: parseInt(formData.brand_id),
        location: formData.location,
        commissioning_date: formData.commissioning_date,
        notes: formData.notes,
        additional_fields: JSON.stringify(additionalFieldsObj),
        quantity: 1,
        last_updated: new Date().toISOString()
      } as any;

      if (editingInventory) {
        const response = await apiService.updateInventory(editingInventory.id, inventoryData);
        if (response.success) {
          toast.success("Inventaire modifié avec succès");
        }
      } else {
        const response = await apiService.createInventory(inventoryData);
        if (response.success) {
          toast.success("Inventaire créé avec succès");
        }
      }
      
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'opération");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet inventaire ?")) return;
    
    try {
      await apiService.deleteInventory(id);
      toast.success("Inventaire supprimé avec succès");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      location: "",
      brand_id: "",
      commissioning_date: "",
      notes: "",
      additional_fields: [
        { key: "", value: "" }
      ]
    });
    setEditingInventory(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (inventory: Inventory) => {
    setEditingInventory(inventory);
    
    // Convert additional_fields to array format
    let additionalFieldsArray = [{ key: "", value: "" }];
    
    if (inventory.additional_fields) {
      try {
        const fieldsObj = typeof inventory.additional_fields === 'string' 
          ? JSON.parse(inventory.additional_fields) 
          : inventory.additional_fields;
          
        if (typeof fieldsObj === 'object' && fieldsObj !== null) {
          additionalFieldsArray = Object.entries(fieldsObj).map(([key, value]) => ({ 
            key, 
            value: String(value) 
          }));
        }
      } catch (e) {
        console.error("Error parsing additional_fields:", e);
      }
    }

    setFormData({
      product_id: inventory.product_id.toString(),
      location: inventory.location,
      brand_id: inventory.brand_id?.toString() || "",
      commissioning_date: inventory.commissioning_date ? inventory.commissioning_date.split('T')[0] : "",
      notes: inventory.notes || "",
      additional_fields: additionalFieldsArray
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion de l'inventaire</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel inventaire
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInventory ? "Modifier l'inventaire" : "Créer un inventaire"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product_id">Produit</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand_id">Marque</Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="commissioning_date">Date de mise en service</Label>
                <Input
                  id="commissioning_date"
                  type="date"
                  value={formData.commissioning_date}
                  onChange={(e) => setFormData({ ...formData, commissioning_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes additionnelles..."
                />
              </div>
              
              {/* Additional Fields */}
              <div className="space-y-3">
                <Label>Champs additionnels</Label>
                {formData.additional_fields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Nom du champ (ex: capacity)"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...formData.additional_fields];
                          newFields[index].key = e.target.value;
                          setFormData({ ...formData, additional_fields: newFields });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Valeur (ex: 5kg)"
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...formData.additional_fields];
                          newFields[index].value = e.target.value;
                          setFormData({ ...formData, additional_fields: newFields });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFields = formData.additional_fields.filter((_, i) => i !== index);
                        setFormData({ ...formData, additional_fields: newFields });
                      }}
                      disabled={formData.additional_fields.length === 1}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      additional_fields: [...formData.additional_fields, { key: "", value: "" }]
                    });
                  }}
                >
                  + Ajouter un champ
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingInventory ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventories.map((inventory) => (
          <Card key={inventory.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                <MapPin className="inline mr-2 h-4 w-4" />
                {inventory.location}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(inventory)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(inventory.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Produit: {inventory.product?.name || products.find(p => p.id === inventory.product_id)?.name || "Non défini"}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Marque: {inventory.brand?.name || brands.find(b => b.id === inventory.brand_id)?.name || "Non définie"}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Serial: {inventory.serial_number}
              </p>
              {inventory.commissioning_date && (
                <p className="text-sm text-muted-foreground mb-2">
                  Mise en service: {new Date(inventory.commissioning_date).toLocaleDateString()}
                </p>
              )}
              {inventory.notes && (
                <p className="text-sm text-muted-foreground mb-2">
                  Notes: {inventory.notes}
                </p>
              )}
              {inventory.additional_fields && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Informations additionnelles:</p>
                  <div className="space-y-1">
                    {(() => {
                      try {
                        const fieldsObj = typeof inventory.additional_fields === 'string' 
                          ? JSON.parse(inventory.additional_fields) 
                          : inventory.additional_fields;
                        
                        if (typeof fieldsObj === 'object' && fieldsObj !== null) {
                          return Object.entries(fieldsObj).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="font-medium">{key}:</span>
                              <span className="text-muted-foreground">{String(value)}</span>
                            </div>
                          ));
                        }
                      } catch (e) {
                        return <span className="text-xs text-muted-foreground">Erreur de format</span>;
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}