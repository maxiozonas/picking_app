import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, ListTodo, Package, Boxes, Users, CircleCheckBig } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/orders', icon: ShoppingCart },
  { name: 'En Proceso', href: '/orders/in-progress', icon: ListTodo },
  { name: 'Completados', href: '/orders/completed', icon: CircleCheckBig },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Empleados', href: '/employees', icon: Users },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-60 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
          <Boxes className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display text-base font-bold uppercase leading-none tracking-wide text-foreground">
            Flexxus
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase leading-none tracking-widest text-muted-foreground">
            Picking Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Menú
        </p>
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'border-l-2 border-primary bg-primary/10 text-primary'
                  : 'border-l-2 border-transparent text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-50">
          v1.1.0
        </p>
      </div>
    </div>
  )
}
