import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminStaff() {
  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Staff del evento</CardTitle>
          <CardDescription>
            Registra y gestiona al personal asignado a cada evento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-200/80">
            (Placeholder. Aquí luego agregamos formulario y tabla de staff.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}