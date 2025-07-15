import { useState } from "react";
import { Plus, Search, Download, Eye, Calendar, FileType, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Document, DocumentType, Product } from "@/types/equipment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const { data: documentsResponse, isLoading, error } = useQuery({
    queryKey: ["documents"],
    queryFn: () => apiService.getDocuments(),
  });

  const { data: documentTypesResponse } = useQuery({
    queryKey: ["document-types"],
    queryFn: () => apiService.getDocumentTypes(),
  });

  const { data: productsResponse } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiService.getProducts(),
  });


  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    document_type_id: "",
    reference: "",
    version: "",
    issue_date: "",
    expiry_date: "",
    product_ids: [] as number[],
    file: null as File | null
  });

  const documents = documentsResponse?.data || [];
  const documentTypes = documentTypesResponse?.data || [];
  const products = productsResponse?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('document_type_id', formData.document_type_id);
      submitData.append('reference', formData.reference);
      submitData.append('version', formData.version);
      submitData.append('issue_date', formData.issue_date);
      if (formData.expiry_date) {
        submitData.append('expiry_date', formData.expiry_date);
      }
      if (formData.product_ids.length > 0) {
        formData.product_ids.forEach(id => {
          submitData.append('product_ids[]', id.toString());
        });
      }
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      if (editingDocument) {
        const response = await apiService.updateDocument(editingDocument.id, submitData);
        if (response.success) {
          toast.success("Document modifié avec succès");
        }
      } else {
        const response = await apiService.createDocument(submitData);
        if (response.success) {
          toast.success("Document créé avec succès");
        }
      }
      
      setDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'opération");
    }
  };

  const handleView = async (document: Document) => {
    try {
      const response = await apiService.downloadDocument(document.id);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ouverture du document");
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await apiService.downloadDocument(doc.id);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${doc.name}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du téléchargement");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    
    try {
      await apiService.deleteDocument(id);
      toast.success("Document supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      document_type_id: "",
      reference: "",
      version: "",
      issue_date: "",
      expiry_date: "",
      product_ids: [],
      file: null
    });
    setEditingDocument(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      document_type_id: document.document_type_id.toString(),
      reference: document.reference,
      version: document.version,
      issue_date: document.issue_date,
      expiry_date: document.expiry_date || "",
      product_ids: document.products?.map(p => p.id) || [],
      file: null
    });
    setDialogOpen(true);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDocumentTypeBadge = (documentType?: { name: string }) => {
    if (!documentType) return <Badge>Unknown</Badge>;
    
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        {documentType.name}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-destructive mb-2">Erreur lors du chargement</div>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Une erreur est survenue"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Gérez les documents techniques de vos équipements
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? "Modifier le document" : "Créer un document"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Référence</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type_id">Type de document</Label>
                  <Select
                    value={formData.document_type_id}
                    onValueChange={(value) => setFormData({ ...formData, document_type_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue_date">Date d'émission</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Date d'expiration</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="product_ids">Produits associés (optionnel)</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const productId = Number(value);
                    if (!formData.product_ids.includes(productId)) {
                      setFormData({ 
                        ...formData, 
                        product_ids: [...formData.product_ids, productId] 
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => !formData.product_ids.includes(p.id)).map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.product_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.product_ids.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return product ? (
                        <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                          {product.name}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              product_ids: formData.product_ids.filter(id => id !== productId)
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="file">Fichier PDF {editingDocument && "(laisser vide pour conserver)"}</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  required={!editingDocument}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seuls les fichiers PDF sont acceptés
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingDocument ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total documents</CardTitle>
            <FileType className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Documents actifs</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirent bientôt</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {documents.filter(doc => isExpiringSoon(doc.expiry_date)).length}
            </div>
            <p className="text-xs text-muted-foreground">Dans les 30 jours</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirés</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {documents.filter(doc => isExpired(doc.expiry_date)).length}
            </div>
            <p className="text-xs text-muted-foreground">À renouveler</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Liste des documents</CardTitle>
          <CardDescription>
            Tous les documents techniques associés aux équipements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, référence ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {document.reference}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getDocumentTypeBadge(document.document_type)}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        v{document.version}
                      </code>
                    </TableCell>
                    <TableCell>{formatDate(document.issue_date)}</TableCell>
                    <TableCell>
                      {document.expiry_date ? (
                        <div className="flex items-center gap-2">
                          {formatDate(document.expiry_date)}
                          {isExpired(document.expiry_date) && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          {isExpiringSoon(document.expiry_date) && !isExpired(document.expiry_date) && (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatFileSize(document.file_size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleView(document)}
                          title="Voir le document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(document)}
                          title="Télécharger le document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(document)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(document.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">Aucun document trouvé</div>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Essayez de modifier votre recherche" : "Commencez par ajouter votre premier document"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}