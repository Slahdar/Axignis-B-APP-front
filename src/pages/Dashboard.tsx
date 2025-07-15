import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Shield, Package, FileText, AlertTriangle, TrendingUp, Users, CheckCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { Product, Document, User, Inventory } from "@/types/equipment";

interface DashboardStats {
  totalProducts: number;
  totalDocuments: number;
  totalUsers: number;
  totalInventories: number;
  expiringDocuments: number;
  expiredDocuments: number;
  activeEquipments: number;
  maintenanceEquipments: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalDocuments: 0,
    totalUsers: 0,
    totalInventories: 0,
    expiringDocuments: 0,
    expiredDocuments: 0,
    activeEquipments: 0,
    maintenanceEquipments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, documentsRes, usersRes, inventoriesRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getDocuments(),
        apiService.getUsers(),
        apiService.getInventories(),
      ]);

      const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data as any)?.data || [];
      const documents = documentsRes.data || [];
      const users = usersRes.data || [];
      const inventories = inventoriesRes.data || [];

      // Calculate expiring and expired documents
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiringDocs = documents.filter((doc: Document) => {
        if (!doc.expiry_date) return false;
        const expiry = new Date(doc.expiry_date);
        return expiry > today && expiry <= thirtyDaysFromNow;
      });

      const expiredDocs = documents.filter((doc: Document) => {
        if (!doc.expiry_date) return false;
        return new Date(doc.expiry_date) < today;
      });

      const activeEquipments = products.filter((p: Product) => p.status === 'active' || !p.status);
      const maintenanceEquipments = products.filter((p: Product) => p.status === 'maintenance');

      setStats({
        totalProducts: products.length,
        totalDocuments: documents.length,
        totalUsers: users.length,
        totalInventories: inventories.length,
        expiringDocuments: expiringDocs.length,
        expiredDocuments: expiredDocs.length,
        activeEquipments: activeEquipments.length,
        maintenanceEquipments: maintenanceEquipments.length,
      });
    } catch (error) {
      console.error("Erreur lors du chargement du tableau de bord:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tableau de Bord - ArchSafe Pro
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la gestion des équipements de sécurité et d'architecture
        </p>
      </div>

      {/* Alertes de sécurité */}
      {(stats.expiredDocuments > 0 || stats.expiringDocuments > 0) && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertes de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {stats.expiredDocuments > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.expiredDocuments} document(s) expiré(s)
                </Badge>
              )}
              {stats.expiringDocuments > 0 && (
                <Badge className="bg-warning text-warning-foreground gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.expiringDocuments} document(s) expire(nt) bientôt
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipements Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.activeEquipments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts > 0 && `${Math.round((stats.activeEquipments / stats.totalProducts) * 100)}% du total`}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.maintenanceEquipments}</div>
            <p className="text-xs text-muted-foreground">Équipements en maintenance</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Techniques</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Certifications et manuels</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Accès au système</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs de performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Équipements</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Inventaire complet</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emplacements</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInventories}</div>
            <p className="text-xs text-muted-foreground">Sites d'installation</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stats.totalDocuments > 0 ? Math.round(((stats.totalDocuments - stats.expiredDocuments) / stats.totalDocuments) * 100) : 100}%
            </div>
            <p className="text-xs text-muted-foreground">Documents valides</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stats.totalProducts > 0 ? Math.round((stats.activeEquipments / stats.totalProducts) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Équipements opérationnels</p>
          </CardContent>
        </Card>
      </div>

      {/* Informations importantes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Informations de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">État des Certifications</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Documents valides</span>
                  <span className="text-success font-medium">
                    {stats.totalDocuments - stats.expiredDocuments - stats.expiringDocuments}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expirent bientôt</span>
                  <span className="text-warning font-medium">{stats.expiringDocuments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expirés</span>
                  <span className="text-destructive font-medium">{stats.expiredDocuments}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">État des Équipements</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Opérationnels</span>
                  <span className="text-success font-medium">{stats.activeEquipments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>En maintenance</span>
                  <span className="text-warning font-medium">{stats.maintenanceEquipments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total installés</span>
                  <span className="font-medium">{stats.totalInventories}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}