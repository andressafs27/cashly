import type { Category, Subcategory } from '@/types'

function sub(id: string, name: string): Subcategory {
  return { id, name, isDefault: true, isActive: true }
}

export const DEFAULT_CATEGORIES: Category[] = [
  // ── Receitas ────────────────────────────────────────────────────────────────
  {
    id: 'salary', name: 'Salário', color: '#00C48C', icon: 'Wallet',
    type: 'income', isDefault: true, isActive: true,
    subcategories: [
      sub('salary-fixo', 'Salário fixo'),
      sub('salary-bonus', 'Bônus'),
      sub('salary-13', '13° salário'),
      sub('salary-ferias', 'Férias'),
    ],
  },
  {
    id: 'freelance', name: 'Freelance', color: '#1B4FDE', icon: 'Briefcase',
    type: 'income', isDefault: true, isActive: true,
    subcategories: [
      sub('free-projeto', 'Projeto'),
      sub('free-consultoria', 'Consultoria'),
      sub('free-aula', 'Aula particular'),
    ],
  },
  {
    id: 'other_income', name: 'Outras Rendas', color: '#A8E6CF', icon: 'Plus',
    type: 'income', isDefault: true, isActive: true,
    subcategories: [
      sub('other-inc-aluguel', 'Aluguel recebido'),
      sub('other-inc-dividendos', 'Dividendos'),
      sub('other-inc-presente', 'Presente'),
      sub('other-inc-venda', 'Venda'),
    ],
  },

  // ── Despesas ─────────────────────────────────────────────────────────────────
  {
    id: 'food', name: 'Alimentação', color: '#FF6B6B', icon: 'UtensilsCrossed',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('food-almoco', 'Almoço'),
      sub('food-jantar', 'Jantar'),
      sub('food-cafe', 'Café da manhã'),
      sub('food-lanche', 'Lanche'),
      sub('food-delivery', 'Delivery'),
      sub('food-restaurante', 'Restaurante'),
    ],
  },
  {
    id: 'transport', name: 'Transporte', color: '#4ECDC4', icon: 'Car',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('transport-app', 'Uber/99'),
      sub('transport-onibus', 'Ônibus/Metrô'),
      sub('transport-gasolina', 'Gasolina'),
      sub('transport-parking', 'Estacionamento'),
      sub('transport-pedagio', 'Pedágio'),
    ],
  },
  {
    id: 'health', name: 'Saúde', color: '#45B7D1', icon: 'Heart',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('health-consulta', 'Consulta médica'),
      sub('health-remedio', 'Medicamentos'),
      sub('health-exame', 'Exames'),
      sub('health-farmacia', 'Farmácia'),
      sub('health-plano', 'Plano de saúde'),
    ],
  },
  {
    id: 'education', name: 'Educação', color: '#96CEB4', icon: 'GraduationCap',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('edu-curso', 'Cursos'),
      sub('edu-livros', 'Livros'),
      sub('edu-mensalidade', 'Mensalidade'),
      sub('edu-material', 'Material escolar'),
    ],
  },
  {
    id: 'leisure', name: 'Lazer', color: '#FFEAA7', icon: 'Gamepad2',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('leisure-cinema', 'Cinema/Shows'),
      sub('leisure-viagem', 'Viagens'),
      sub('leisure-games', 'Games'),
      sub('leisure-passeio', 'Parque/Passeio'),
    ],
  },
  {
    id: 'shopping', name: 'Compras', color: '#DDA0DD', icon: 'ShoppingBag',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('shop-roupas', 'Roupas'),
      sub('shop-eletronicos', 'Eletrônicos'),
      sub('shop-casa', 'Casa e decoração'),
      sub('shop-acessorios', 'Acessórios'),
    ],
  },
  {
    id: 'housing', name: 'Moradia', color: '#98D8C8', icon: 'Home',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('house-aluguel', 'Aluguel'),
      sub('house-condominio', 'Condomínio'),
      sub('house-luz', 'Conta de luz'),
      sub('house-agua', 'Água e gás'),
      sub('house-internet', 'Internet'),
    ],
  },
  {
    id: 'streaming', name: 'Streaming', color: '#F7DC6F', icon: 'Tv',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('stream-netflix', 'Netflix'),
      sub('stream-spotify', 'Spotify'),
      sub('stream-disney', 'Disney+'),
      sub('stream-amazon', 'Amazon Prime'),
      sub('stream-youtube', 'YouTube Premium'),
    ],
  },
  {
    id: 'other_expense', name: 'Outros Gastos', color: '#BDC3C7', icon: 'MoreHorizontal',
    type: 'expense', isDefault: true, isActive: true,
    subcategories: [
      sub('other-exp-geral', 'Outros gastos'),
    ],
  },

  // ── Poupança ──────────────────────────────────────────────────────────────────
  {
    id: 'emergency', name: 'Reserva de Emergência', color: '#8B5CF6', icon: 'Star',
    type: 'saving', isDefault: true, isActive: true,
    subcategories: [],
  },
  {
    id: 'investment', name: 'Investimentos', color: '#6366F1', icon: 'Zap',
    type: 'saving', isDefault: true, isActive: true,
    subcategories: [
      sub('inv-renda-fixa', 'Renda fixa'),
      sub('inv-acoes', 'Ações/FIIs'),
      sub('inv-cripto', 'Criptomoedas'),
    ],
  },
]
