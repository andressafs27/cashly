import { type FC, useState, useRef } from 'react'
import { X, Check, Plus, Trash2, Pencil, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react'
import { toast } from 'sonner'
import { Input, Button, Toggle } from '@/components/atoms'
import { useCategoryStore } from '@/store'
import { useModalA11y } from '@/hooks'
import { ICON_MAP, ICON_GROUPS, AVAILABLE_COLORS, getCategoryIcon } from '@/utils/categoryIcon'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Category, CategoryType, Subcategory } from '@/types'

const TYPE_OPTIONS: { value: CategoryType; label: string; activeClass: string; icon: typeof TrendingDown }[] = [
  { value: 'expense', label: 'Despesa',  activeClass: 'bg-danger/10  text-danger  ring-2 ring-danger/20',        icon: TrendingDown },
  { value: 'income',  label: 'Receita',  activeClass: 'bg-accent/10  text-accent  ring-2 ring-accent/20',        icon: TrendingUp   },
  { value: 'saving',  label: 'Poupança', activeClass: 'bg-violet-500/10 text-violet-500 ring-2 ring-violet-500/20', icon: PiggyBank  },
]

function IconButton({ iconName, Icon, selected, onSelect }: {
  iconName: string
  Icon: LucideIcon
  selected: boolean
  onSelect: (name: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(iconName)}
      aria-label={`Ícone ${iconName}`}
      aria-pressed={selected}
      className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
        selected ? 'bg-primary/10 text-primary ring-2 ring-primary/30' : 'text-light hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-mid'
      )}
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  )
}

interface CategoryFormProps {
  category?:    Category
  defaultType?: CategoryType
  onClose: () => void
}

// ── Subcategory row com rename inline ────────────────────────────────────────

interface SubcatRowProps {
  subcat: Subcategory
  onToggle:  (id: string) => void
  onDelete:  (id: string) => void
  onRename:  (id: string, name: string) => void
}

function SubcatRow({ subcat, onToggle, onDelete, onRename }: SubcatRowProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(subcat.name)
  const inputRef              = useRef<HTMLInputElement>(null)
  const isActive              = subcat.isActive ?? true

  function startEdit() {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function saveEdit() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== subcat.name) onRename(subcat.id, trimmed)
    else setName(subcat.name)
    setEditing(false)
  }

  return (
    <div className={cn(
      'flex items-center gap-2 py-2 px-3 rounded-xl group/row transition-colors',
      isActive ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60' : 'opacity-50'
    )}>
      {editing ? (
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setName(subcat.name); setEditing(false) } }}
          className="flex-1 text-sm text-dark border-b border-primary bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/30 rounded pb-0.5"
          aria-label={`Editar nome de ${subcat.name}`}
        />
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="flex-1 text-left text-sm text-dark hover:text-primary transition-colors flex items-center gap-1.5 group/name"
          aria-label={`Renomear ${subcat.name}`}
        >
          {subcat.name}
          <Pencil size={11} className="text-light opacity-0 group-hover/name:opacity-100 transition-opacity" aria-hidden="true" />
        </button>
      )}

      <Toggle
        checked={isActive}
        onChange={() => onToggle(subcat.id)}
        label={isActive ? `Desativar ${subcat.name}` : `Ativar ${subcat.name}`}
      />

      {!subcat.isDefault ? (
        <button
          type="button"
          onClick={() => onDelete(subcat.id)}
          aria-label={`Remover ${subcat.name}`}
          className="p-1 text-light hover:text-danger transition-colors opacity-0 group-hover/row:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      ) : (
        <span className="w-5" aria-hidden="true" />
      )}
    </div>
  )
}

// ── CategoryForm ─────────────────────────────────────────────────────────────

export const CategoryForm: FC<CategoryFormProps> = ({ category, defaultType = 'expense', onClose }) => {
  const isEdit = !!category
  const { addCategory, updateCategory } = useCategoryStore()

  const [selectedType,  setSelectedType]  = useState<CategoryType>(category?.type ?? defaultType)
  const [name,          setName]          = useState(category?.name ?? '')
  const [nameError,     setNameError]     = useState('')
  const [selectedColor, setSelectedColor] = useState(category?.color ?? AVAILABLE_COLORS[0])
  const [selectedIcon,  setSelectedIcon]  = useState(category?.icon  ?? Object.keys(ICON_GROUPS[0].icons)[0])
  const [iconSearch,    setIconSearch]    = useState('')
  const [subcats,       setSubcats]       = useState<Subcategory[]>(category?.subcategories ?? [])
  const [newSubcatName, setNewSubcatName] = useState('')

  const modalRef = useModalA11y(onClose)

  // ── Subcategory handlers ──
  function addSubcat() {
    const trimmed = newSubcatName.trim()
    if (!trimmed) return
    setSubcats((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed, isDefault: false, isActive: true }])
    setNewSubcatName('')
  }

  function toggleSubcat(id: string) {
    setSubcats((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !(s.isActive ?? true) } : s))
  }

  function deleteSubcat(id: string) {
    setSubcats((prev) => prev.filter((s) => s.id !== id))
  }

  function renameSubcat(id: string, newName: string) {
    setSubcats((prev) => prev.map((s) => s.id === id ? { ...s, name: newName } : s))
  }

  // ── Submit ──
  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setNameError('Nome obrigatório'); return }
    if (trimmed.length > 30) { setNameError('Máximo 30 caracteres'); return }

    const data = { name: trimmed, color: selectedColor, icon: selectedIcon, type: selectedType, subcategories: subcats }

    if (isEdit && category) {
      updateCategory(category.id, data)
      toast.success('Categoria atualizada!')
    } else {
      addCategory({ id: crypto.randomUUID(), ...data, isDefault: false, isActive: true })
      toast.success('Categoria criada!')
    }
    onClose()
  }

  const PreviewIcon = getCategoryIcon(selectedIcon)
  const activeSubcats = subcats.filter((s) => s.isActive ?? true).length

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <h2 id="category-form-title" className="text-dark font-bold text-lg">
            {isEdit ? 'Editar categoria' : 'Nova categoria'}
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-lg text-light hover:text-dark hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 overflow-y-auto flex-1">

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all" style={{ backgroundColor: `${selectedColor}20` }}>
              <PreviewIcon size={22} style={{ color: selectedColor }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-dark font-semibold text-sm">{name || 'Nome da categoria'}</p>
              <p className="text-light text-xs mt-0.5">{activeSubcats} subcategoria{activeSubcats !== 1 ? 's' : ''} ativa{activeSubcats !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Tipo */}
          <div>
            <p className="text-sm font-medium text-mid mb-2">Tipo</p>
            {category?.isDefault ? (
              /* Padrão: exibe o tipo mas não permite alterar */
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-700">
                {(() => { const opt = TYPE_OPTIONS.find((o) => o.value === selectedType); const Icon = opt?.icon ?? TrendingDown; return <Icon size={15} className="text-light" aria-hidden="true" /> })()}
                <span className="text-sm text-mid">{TYPE_OPTIONS.find((o) => o.value === selectedType)?.label}</span>
                <span className="text-xs text-light ml-1">· padrão</span>
              </div>
            ) : (
              /* Custom: permite escolher */
              <div className="flex gap-2">
                {TYPE_OPTIONS.map(({ value, label, activeClass, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedType(value)}
                    aria-pressed={selectedType === value}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      selectedType === value ? activeClass : 'bg-slate-50 dark:bg-slate-950 text-mid hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nome */}
          <Input
            label="Nome"
            placeholder="Ex: Viagens, Pet, Farmácia..."
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError('') }}
            error={nameError}
            maxLength={30}
          />

          {/* Cor */}
          <div>
            <p className="text-sm font-medium text-mid mb-3">Cor</p>
            <div className="grid grid-cols-8 gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Selecionar cor ${color}`}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check size={14} className="text-white drop-shadow" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Ícone */}
          <div>
            <p className="text-sm font-medium text-mid mb-2">Ícone</p>

            {/* Busca */}
            <input
              type="search"
              placeholder="Buscar ícone..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              aria-label="Buscar ícone"
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-dark placeholder:text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
            />

            <div className="max-h-52 overflow-y-auto pr-1 space-y-3">
              {(() => {
                const q = iconSearch.toLowerCase()

                if (q) {
                  // Busca: grid flat filtrado
                  const matches = Object.entries(ICON_MAP).filter(([name]) =>
                    name.toLowerCase().includes(q)
                  )
                  if (matches.length === 0) {
                    return <p className="text-light text-xs text-center py-4">Nenhum ícone encontrado</p>
                  }
                  return (
                    <div className="grid grid-cols-8 gap-1.5">
                      {matches.map(([iconName, Icon]) => (
                        <IconButton key={iconName} iconName={iconName} Icon={Icon}
                          selected={selectedIcon === iconName} onSelect={setSelectedIcon} />
                      ))}
                    </div>
                  )
                }

                // Sem busca: grupos
                return ICON_GROUPS.map(({ label, icons }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-light uppercase tracking-wider mb-1.5 px-0.5">
                      {label}
                    </p>
                    <div className="grid grid-cols-8 gap-1.5">
                      {Object.entries(icons).map(([iconName, Icon]) => (
                        <IconButton key={iconName} iconName={iconName} Icon={Icon}
                          selected={selectedIcon === iconName} onSelect={setSelectedIcon} />
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>

          {/* ── Subcategorias ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-mid">
                Subcategorias
                <span className="ml-2 text-light font-normal">({activeSubcats} ativa{activeSubcats !== 1 ? 's' : ''})</span>
              </p>
            </div>

            {subcats.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl mb-3 divide-y divide-slate-100">
                {subcats.map((s) => (
                  <SubcatRow
                    key={s.id}
                    subcat={s}
                    onToggle={toggleSubcat}
                    onDelete={deleteSubcat}
                    onRename={renameSubcat}
                  />
                ))}
              </div>
            )}

            {/* Adicionar subcategoria */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nova subcategoria..."
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcat())}
                className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-dark placeholder:text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Nome da nova subcategoria"
              />
              <button
                type="button"
                onClick={addSubcat}
                disabled={!newSubcatName.trim()}
                aria-label="Adicionar subcategoria"
                className="px-3 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1">
              {isEdit ? 'Salvar' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
