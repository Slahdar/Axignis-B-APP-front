import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { EquipmentType, Family } from "@/types/equipment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Settings } from "lucide-react";
import { toast } from "sonner";

export default function EquipmentTypesPage() {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<EquipmentType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    family_id: "",
    inventory_required: false,
    additional_fields: [
      { key: "", type: "string", required: false, label: "" }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [typesRes, familiesRes] = await Promise.all([
        apiService.getEquipmentTypes(),
        apiService.getFamilies()
      ]);
      
      if (typesRes.success) setEquipmentTypes(typesRes.data);
      if (familiesRes.success) setFamilies(familiesRes.data);
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
        if (field.key) {
          additionalFieldsObj[field.key] = {
            type: field.type,
            required: field.required,
            label: field.label || field.key
          };
        }
      });

      const typeData = {
        title: formData.title,
        subtitle: formData.subtitle,
        family_id: parseInt(formData.family_id),
        inventory_required: formData.inventory_required,
        additional_fields: JSON.stringify(additionalFieldsObj)
      } as any;

      if (editingType) {
        const response = await apiService.updateEquipmentType(editingType.id, typeData);
        if (response.success) {
          toast.success("Type d'équipement modifié avec succès");
        }
      } else {
        const response = await apiService.createEquipmentType(typeData);
        if (response.success) {
          toast.success("Type d'équipement créé avec succès");
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce type d'équipement ?")) return;
    
    try {
      await apiService.deleteEquipmentType(id);
      toast.success("Type d'équipement supprimé avec succès");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      family_id: "",
      inventory_required: false,
      additional_fields: [
        { key: "", type: "string", required: false, label: "" }
      ]
    });
    setEditingType(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (type: EquipmentType) => {
    setEditingType(type);
    
    // Convert additional_fields object to array format
    let additionalFieldsArray = [{ key: "", type: "string", required: false, label: "" }];
    
    if (type.additional_fields) {
      try {
        // If it's a string, parse it
        const fieldsObj = typeof type.additional_fields === 'string' 
          ? JSON.parse(type.additional_fields) 
          : type.additional_fields;
          
        if (typeof fieldsObj === 'object' && fieldsObj !== null) {
          additionalFieldsArray = Object.entries(fieldsObj).map(([key, config]: [string, any]) => ({
            key,
            type: config?.type || "string",
            required: config?.required || false,
            label: config?.label || key
          }));
        }
      } catch (e) {
        console.error("Error parsing additional_fields:", e);
      }
    }

    setFormData({
      title: type.title,
      subtitle: type.subtitle || "",
      family_id: type.family_id.toString(),
      inventory_required: type.inventory_required || false,
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
        <h1 className="text-2xl font-bold">Gestion des types d'équipements</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingType ? "Modifier le type d'équipement" : "Créer un type d'équipement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="family_id">Famille</Label>
                <Select
                  value={formData.family_id}
                  onValueChange={(value) => setFormData({ ...formData, family_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une famille" />
                  </SelectTrigger>
                  <SelectContent>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={family.id.toString()}>
                        {family.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="inventory_required"
                  checked={formData.inventory_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, inventory_required: checked })}
                />
                <Label htmlFor="inventory_required">Inventaire requis</Label>
              </div>
              
              {/* Additional Fields */}
              <div className="space-y-3">
                <Label>Champs additionnels</Label>
                {formData.additional_fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-3">
                      <Label className="text-xs">Nom du champ</Label>
                      <Input
                        placeholder="Ex: capacity"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...formData.additional_fields];
                          newFields[index].key = e.target.value;
                          setFormData({ ...formData, additional_fields: newFields });
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Libellé</Label>
                      <Input
                        placeholder="Ex: Capacité"
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...formData.additional_fields];
                          newFields[index].label = e.target.value;
                          setFormData({ ...formData, additional_fields: newFields });
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => {
                          const newFields = [...formData.additional_fields];
                          newFields[index].type = value;
                          setFormData({ ...formData, additional_fields: newFields });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">Texte</SelectItem>
                          <SelectItem value="number">Nombre</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="boolean">Booléen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => {
                            const newFields = [...formData.additional_fields];
                            newFields[index].required = checked;
                            setFormData({ ...formData, additional_fields: newFields });
                          }}
                        />
                        <Label className="text-xs">Requis</Label>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFields = formData.additional_fields.filter((_, i) => i !== index);
                          setFormData({ ...formData, additional_fields: newFields });
                        }}
                        disabled={formData.additional_fields.length === 1}
                        className="w-full"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      additional_fields: [...formData.additional_fields, { key: "", type: "string", required: false, label: "" }]
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
                  {editingType ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipmentTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                <Settings className="inline mr-2 h-4 w-4" />
                {type.title}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(type)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(type.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {type.subtitle && (
                <p className="text-sm text-muted-foreground mb-2">{type.subtitle}</p>
              )}
              <p className="text-sm text-muted-foreground mb-1">
                Famille: {families.find(f => f.id === type.family_id)?.name}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Inventaire: {type.inventory_required ? "Requis" : "Non requis"}
              </p>
              
              {type.additional_fields && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Champs additionnels:</p>
                  <div className="space-y-1">
                    {(() => {
                      try {
                        const fieldsObj = typeof type.additional_fields === 'string' 
                          ? JSON.parse(type.additional_fields) 
                          : type.additional_fields;
                        
                        if (typeof fieldsObj === 'object' && fieldsObj !== null) {
                          return Object.entries(fieldsObj).map(([key, config]: [string, any]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="font-medium">{config?.label || key}:</span>
                              <span className="text-muted-foreground">
                                {config?.type || "string"} {config?.required && "(requis)"}
                              </span>
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
              
              <p className="text-xs text-muted-foreground mt-2">
                Créé le {new Date(type.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}