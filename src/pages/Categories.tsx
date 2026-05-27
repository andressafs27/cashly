import { useState } from 'react'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, PiggyBank, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryForm } from '@/components/organisms/CategoryForm'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Button, Toggle } from '@/components/atoms'
import { useCategoryStore } from '@/store'
import { useTransactionStore } from '@/store'
import { getCategoryIcon } from '@/utils/categoryIcon'
import { cn } from '@/utils/cn'
import type { Category, CategoryType } from '@/types'

// ── Configuração de grupos ───────────────────────────────────────────────────

const GROUPS: { type: CategoryType; label: string; icon: LucideIcon; emptyMsg: string }[] = [
  { type: 'income',  label: 'Receitas',  icon: TrendingUp,   emptyMsg: 'Nenhuma categoria de receita' },
  { type: 'expense', label: 'Despesas',  icon: TrendingDown, emptyMsg: 'Nenhuma categoria de despesa' },
  { type: 'saving',  label: 'Poupança',  icon: PiggyBank,    emptyMsg: 'Nenhuma categoria de poupança' },
]

const TYPE_COLORS: Record<CategoryType, string> = {
  income:  'text-accent',
  expense: 'text-danger',
  saving:  'text-violet-500',
}

const TYPE_BG: Record<CategoryType, string> = {
  income:  'bg-accent/10',
  expense: 'bg-danger/10',
  saving:  'bg-violet-500/10',
}

// ── Página ───────────────────────────────────────────────────────────────────

export function Categories() {
  const categories     = useCategoryStore((s) => s.categories)
  const updateCategory = useCategoryStore((s) => s.updateCategory)
  const deleteCategory = useCategoryStore((s) => s.deleteCategory)
  const transactions   = useTransactionStore((s) => s.transactions)

  const [formOpen,     setFormOpen]     = useState(false)
  const [editing,      setEditing]      = useState<Category | null>(null)
  const [defaultType,  setDefaultType]  = useState<CategoryType>('expense')

  function usageCount(id: string) {
    return transactions.filter((t) => t.categoryId === id).length
  }

  function handleToggle(category: Category) {
    const isActive = category.isActive ?? true
    if (isActive && usageCount(category.id) > 0) {
      const n = usageCount(category.id)
      toast.error(`"${category.name}" não pode ser desativada — ${n} lançamento${n > 1 ? 's vinculados' : ' vinculado'}`)
      return
    }
    updateCategory(category.id, { isActive: !isActive })
    toast.success(isActive ? `"${category.name}" desativada` : `"${category.name}" ativada`)
  }

  function handleDelete(category: Category) {
    if (category.isDefault) { toast.error('Categorias padrão não podem ser excluídas'); return }
    const n = usageCount(category.id)
    if (n > 0) { toast.error(`Não é possível excluir — ${n} lançamento${n > 1 ? 's vinculados' : ' vinculado'}`); return }
    deleteCategory(category.id)
    toast.success(`"${category.name}" excluída`)
  }

  function handleEdit(category: Category) { setEditing(category); setFormOpen(true) }

  function handleNew(type: CategoryType) {
    setDefaultType(type)
    setEditing(null)
    setFormOpen(true)
  }

  function handleClose() { setFormOpen(false); setEditing(null) }

  const activeTotal = categories.filter((c) => c.isActive ?? true).length

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-dark text-2xl font-bold">Categorias</h1>
          <p className="text-light text-sm mt-1">{activeTotal} ativas · {categories.length} no total</p>
        </div>
        <Button onClick={() => handleNew('expense')} iconLeft={<Plus size={16} />} size="md">
          Nova categoria
        </Button>
      </div>

      {/* Grupos por tipo */}
      <div className="flex flex-col gap-10">
        {GROUPS.map(({ type, label, icon: GroupIcon, emptyMsg }) => {
          const group = categories.filter((c) => (c.type ?? 'expense') === type)
          return (
            <section key={type} aria-labelledby={`group-${type}`}>
              {/* Cabeçalho do grupo */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', TYPE_BG[type])}>
                    <GroupIcon size={15} className={TYPE_COLORS[type]} aria-hidden="true" />
                  </div>
                  <h2 id={`group-${type}`} className="text-dark text-sm font-semibold">
                    {label}
                    <span className="text-light font-normal ml-2">({group.length})</span>
                  </h2>
                </div>
                <button
                  onClick={() => handleNew(type)}
                  className="flex items-center gap-1.5 text-xs text-light hover:text-primary transition-colors"
                >
                  <Plus size={13} aria-hidden="true" />
                  Adicionar
                </button>
              </div>

              {/* Grid de cards */}
              {group.length === 0 ? (
                <EmptyState
                  icon={GroupIcon}
                  title={emptyMsg}
                  description={`Crie uma categoria de ${label.toLowerCase()} para organizar seus lançamentos.`}
                  action={{ label: `+ Nova categoria de ${label.toLowerCase()}`, onClick: () => handleNew(type) }}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {group.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      usage={usageCount(cat.id)}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {formOpen && (
        <CategoryForm
          category={editing ?? undefined}
          defaultType={defaultType}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

// ── CategoryCard ──────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: Category
  usage:    number
  onToggle: (c: Category) => void
  onEdit:   (c: Category) => void
  onDelete: (c: Category) => void
}

function CategoryCard({ category, usage, onToggle, onEdit, onDelete }: CategoryCardProps) {
  const Icon       = getCategoryIcon(category.icon)
  const isActive   = category.isActive ?? true
  const canDelete  = !category.isDefault && usage === 0
  const activeSubs = (category.subcategories ?? []).filter((s) => s.isActive ?? true).length

  return (
    <div className={cn(
      'group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 transition-all',
      isActive ? 'hover:shadow-md' : 'opacity-60'
    )}>
      {/* Ícone + Toggle */}
      <div className="flex items-start justify-between">
        <div
          className={cn('w-11 h-11 rounded-xl flex items-center justify-center', !isActive && 'grayscale')}
          style={{ backgroundColor: `${category.color}18` }}
        >
          <Icon size={20} style={{ color: isActive ? category.color : '#94A3B8' }} aria-hidden="true" />
        </div>
        <Toggle
          checked={isActive}
          onChange={() => onToggle(category)}
          disabled={!isActive ? false : usage > 0}
          label={isActive ? `Desativar ${category.name}` : `Ativar ${category.name}`}
        />
      </div>

      {/* Info */}
      <div>
        <p className={cn('text-sm font-semibold truncate', isActive ? 'text-dark' : 'text-mid')}>
          {category.name}
        </p>
        <p className="text-light text-xs mt-0.5">
          {activeSubs > 0 ? `${activeSubs} subcat.` : 'Sem subcategorias'}
          {usage > 0 && ` · ${usage} uso${usage > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Badge + ações */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
          !isActive          ? 'bg-slate-100 text-slate-400' :
          category.isDefault ? 'bg-slate-100 text-mid'       :
                               'bg-primary/10 text-primary'
        )}>
          {!isActive ? 'Inativa' : category.isDefault ? 'Padrão' : 'Custom'}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(category)} aria-label={`Editar ${category.name}`}
            className="p-1.5 rounded-lg text-light hover:text-primary hover:bg-blue-50 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(category)} aria-label={`Excluir ${category.name}`}
            disabled={!canDelete}
            className={cn('p-1.5 rounded-lg transition-colors',
              canDelete ? 'text-light hover:text-danger hover:bg-red-50' : 'text-slate-200 cursor-not-allowed'
            )}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
