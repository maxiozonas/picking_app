import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  totalOrders?: number;
  completedOrders?: number;
  inProgressOrders?: number;
  alertsCount?: number;
}

export function StatsCards({
  totalOrders = 0,
  completedOrders = 0,
  inProgressOrders = 0,
  alertsCount = 0,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Pedidos",
      value: totalOrders,
      icon: Package,
      description: "Pedidos del día",
    },
    {
      title: "Completados",
      value: completedOrders,
      icon: CheckCircle,
      description: "Pedidos terminados",
    },
    {
      title: "En Proceso",
      value: inProgressOrders,
      icon: Clock,
      description: "Pedidos activos",
    },
    {
      title: "Alertas",
      value: alertsCount,
      icon: AlertTriangle,
      description: "Requieren atención",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
