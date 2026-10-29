export interface ItemCardapio {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'cuscuz' | 'tapiocas' | 'bolos' | 'bebidas';
  preco: number;
  exigeCozinhaCompleta: boolean;
  disponivel: boolean;
  sazonalJunino?: boolean;
}

export interface UnidadeFranquia {
  id: string;
  nome: string;
  cidade: string;
  formato: 'cozinha-completa' | 'cozinha-reduzida';
  estoqueLocal: Record<string, number>;
}

export const cardapioBase: ItemCardapio[] = [
  {
    id: 'prod-01',
    nome: 'Cuscuz Tradicional Completo',
    descricao: 'Cuscuz de milho flocão com carne de sol desfiada, queijo coalho e manteiga de garrafa.',
    categoria: 'cuscuz',
    preco: 22.90,
    exigeCozinhaCompleta: true,
    disponivel: true,
  },
  {
    id: 'prod-02',
    nome: 'Cuscuz Simples com Manteiga de Garrafa',
    descricao: 'Cuscuz nordestino tradicional umedecido com manteiga da terra.',
    categoria: 'cuscuz',
    preco: 12.00,
    exigeCozinhaCompleta: false,
    disponivel: true,
  },
  {
    id: 'prod-03',
    nome: 'Tapioca de Carne de Sol com Queijo Coalho',
    descricao: 'Goma fresca recheada na chapa com queijo tostado e carne de sol.',
    categoria: 'tapiocas',
    preco: 20.00,
    exigeCozinhaCompleta: false,
    disponivel: true,
  },
  {
    id: 'prod-04',
    nome: 'Bolo de Macaxeira com Calda Regional',
    descricao: 'Fatia artesanal de bolo cremoso de macaxeira com melaço de cana.',
    categoria: 'bolos',
    preco: 10.50,
    exigeCozinhaCompleta: false,
    disponivel: true,
  },
  {
    id: 'prod-05',
    nome: 'Suco de Graviola da Fruta (500ml)',
    descricao: 'Suco natural batido na hora com polpa fresca da fruta.',
    categoria: 'bebidas',
    preco: 9.00,
    exigeCozinhaCompleta: false,
    disponivel: true,
  },
  {
    id: 'prod-06',
    nome: 'Canjica Cremosa com Canela (Sazonal Junino)',
    descricao: 'Prato tradicional junino feito com milho verde e leite de coco.',
    categoria: 'bolos',
    preco: 14.00,
    exigeCozinhaCompleta: true,
    disponivel: true,
    sazonalJunino: true,
  },
];

export const unidadesCadastradas: UnidadeFranquia[] = [
  {
    id: 'recife-matriz',
    nome: 'Unidade Recife Centro (Matriz)',
    cidade: 'Recife',
    formato: 'cozinha-completa',
    estoqueLocal: {
      'prod-01': 50,
      'prod-02': 80,
      'prod-03': 60,
      'prod-04': 1, // Definido como 1 para teste de concorrência atômica (CT-04)
      'prod-05': 100,
      'prod-06': 30,
    },
  },
  {
    id: 'shopping-express',
    nome: 'Unidade Shopping Express',
    cidade: 'Olinda',
    formato: 'cozinha-reduzida',
    estoqueLocal: {
      'prod-02': 40,
      'prod-03': 30,
      'prod-04': 15,
      'prod-05': 50,
      // Não possui prod-01 e prod-06 porque é cozinha reduzida
    },
  },
];

