import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, ListTodo, Package, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/orders', icon: ShoppingCart },
  { name: 'En Proceso', href: '/orders/in-progress', icon: ListTodo },
  { name: 'Inventario', href: '/inventory', icon: Package },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold">Flexxus Picking</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-2">
        <Link to="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-5 w-5" />
            Configuración
          </Button>
        </Link>
      </div>
    </div>
  )
}
