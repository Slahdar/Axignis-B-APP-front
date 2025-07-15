import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { User } from "@/types/equipment";
import { AVAILABLE_PERMISSIONS, getPermissionsByCategory, Permission } from "@/data/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, Shield, Save, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function UserPermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [openUsers, setOpenUsers] = useState<Record<number, boolean>>({});
  
  const permissionsByCategory = getPermissionsByCategory();

  const toggleUser = (userId: number) => {
    setOpenUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const usersRes = await apiService.getUsers();
      
      if (usersRes.success) {
        setUsers(usersRes.data);
        // Initialize user permissions state based on user's existing permissions
        const initialUserPermissions: Record<number, number[]> = {};
        
        usersRes.data.forEach(user => {
          // Map user permissions to available permission IDs by name
          const userPermissionIds: number[] = [];
          user.permissions?.forEach(userPerm => {
            const availablePerm = AVAILABLE_PERMISSIONS.find(p => p.name === userPerm.name);
            if (availablePerm) {
              userPermissionIds.push(availablePerm.id);
            }
          });
          initialUserPermissions[user.id] = userPermissionIds;
        });
        
        setUserPermissions(initialUserPermissions);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (userId: number, permissionId: number, checked: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [userId]: checked 
        ? [...(prev[userId] || []), permissionId]
        : (prev[userId] || []).filter(id => id !== permissionId)
    }));
  };

  const saveUserPermissions = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Get current user permissions by name
      const currentPermissionNames = user.permissions?.map(p => p.name) || [];
      
      // Get new selected permissions by name
      const selectedPermissionIds = userPermissions[userId] || [];
      const selectedPermissionNames = selectedPermissionIds.map(id => {
        const permission = AVAILABLE_PERMISSIONS.find(p => p.id === id);
        return permission?.name || '';
      }).filter(name => name !== '');

      // Find permissions to add and remove
      const permissionsToAdd = selectedPermissionNames.filter(name => !currentPermissionNames.includes(name));
      const permissionsToRemove = currentPermissionNames.filter(name => !selectedPermissionNames.includes(name));

      console.log('Current permissions:', currentPermissionNames);
      console.log('Selected permissions:', selectedPermissionNames);
      console.log('Permissions to add:', permissionsToAdd);
      console.log('Permissions to remove:', permissionsToRemove);

      // If no changes, don't make API calls
      if (permissionsToAdd.length === 0 && permissionsToRemove.length === 0) {
        toast.info("Aucune modification détectée");
        return;
      }

      // Process additions and removals
      const promises: Promise<any>[] = [];
      
      // Add new permissions
      for (const permission of permissionsToAdd) {
        promises.push(apiService.assignPermissionToUser(userId, permission));
      }
      
      // Remove old permissions
      for (const permission of permissionsToRemove) {
        promises.push(apiService.removePermissionFromUser(userId, permission));
      }

      // Execute all changes
      await Promise.all(promises);
      
      toast.success(`Permissions mises à jour avec succès (${permissionsToAdd.length} ajoutées, ${permissionsToRemove.length} supprimées)`);
      
      // Refresh data to get updated user permissions
      await loadData();
      
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast.error(error.message || "Erreur lors de la mise à jour des permissions");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Gestion des Permissions
          </h1>
          <p className="text-muted-foreground">
            Configurez les autorisations d'accès pour chaque utilisateur
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="shadow-card">
            <Collapsible open={openUsers[user.id]} onOpenChange={() => toggleUser(user.id)}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                    <div className="flex items-center gap-3">
                      {openUsers[user.id] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Users className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground font-normal">{user.email}</div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-2">
                    {user.roles?.map((role, index) => (
                      <Badge key={index} variant="secondary">
                        {role.name}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="ml-2">
                      {user.permissions?.length || 0} permissions
                    </Badge>
                    {openUsers[user.id] && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          saveUserPermissions(user.id);
                        }}
                        size="sm"
                        className="ml-4"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            {category}
                          </h4>
                          <Separator className="flex-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-2 p-2 rounded border">
                              <Checkbox
                                id={`user-${user.id}-perm-${permission.id}`}
                                checked={(userPermissions[user.id] || []).includes(permission.id)}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(user.id, permission.id, checked as boolean)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`user-${user.id}-perm-${permission.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}