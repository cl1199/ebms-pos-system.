import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminUsers() {
  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Panel de usuarios</CardTitle>
          <CardDescription>
            Crea, edita y desactiva usuarios del sistema EBMS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-200/80">
            (Placeholder. Más adelante aquí armamos CRUD completo de usuarios.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}