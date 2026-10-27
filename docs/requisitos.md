# Engenharia de Requisitos de Qualidade - Rede Raízes do Nordeste

## 1. Contexto e Visão Geral do Sistema

A rede "Raízes do Nordeste" nasceu como um empreendimento familiar em Recife focado na culinária regional (cuscuz, tapiocas, bolo de macaxeira e sucos típicos) e atualmente passa por um processo acelerado de expansão no modelo de franquias em capitais e cidades do interior do Brasil. 

Com o aumento da quantidade de lojas e o fluxo intenso em horários de pico, a operação passou a exigir uma solução tecnológica integrada. O objetivo principal do sistema é unificar a jornada de atendimento ao cliente em múltiplos canais, padronizar a experiência de consumo entre as franquias, controlar a disponibilidade de estoque local e fornecer visibilidade gerencial para a matriz, assegurando confiabilidade, segurança da informação e conformidade com a Lei Geral de Proteção de Dados (LGPD).

Sob a perspectiva da Engenharia de Software e Garantia da Qualidade (QA), o sistema deve ser projetado para garantir que regras de negócio complexas, diferenças estruturais entre unidades e integrações externas (como processamento de pagamentos) funcionem de forma consistente, resiliente e auditável.

## 2. Multicanalidade e Jornada do Usuário

O sistema atende os clientes através de quatro pontos de contato complementares, garantindo que a consulta ao cardápio, a seleção de produtos e o pagamento ocorram de forma fluida:

1. Aplicativo Oficial (Mobile): Permite aos clientes navegar pelo cardápio da unidade mais próxima, realizar pedidos antecipados, acumular pontos no programa de fidelidade e acompanhar o status de preparo em tempo real.
2. Totens de Autoatendimento: Terminais instalados nas lojas físicas para reduzir filas no balcão, permitindo que o cliente consulte o cardápio com fotos, monte seu pedido e pague de forma autônoma.
3. Atendimento Presencial no Balcão: Interface voltada ao atendente da loja para registrar pedidos de clientes que optam pelo atendimento humano ou que pagam em dinheiro, conectando-se diretamente à fila da cozinha.
4. Retirada Rápida (Pick-up): Fluxo voltado a clientes que compraram previamente pelo aplicativo e se dirigem ao balcão exclusivo apenas para conferência do código do pedido e retirada imediata, sem necessidade de nova triagem.

## 3. Mapeamento de Atores

Para delimitar responsabilidades e pontos de teste, identificamos os seguintes atores do sistema:

1. Cliente: Usuário final que interage com o aplicativo ou totem para consultar cardápios, emitir pedidos, efetuar pagamentos e gerenciar seus dados no programa de fidelidade.
2. Atendente de Balcão: Operador da unidade responsável pelo atendimento presencial, registro de pedidos manuais, recebimento em dinheiro e entrega de pedidos no balcão.
3. Equipe de Cozinha / Expedição: Responsáveis pela visualização da fila de pedidos em tempo real, controle de tempo de preparo e atualização dos status (recebido, em preparo, pronto para retirada).
4. Gerente da Unidade: Responsável pela administração local, entrada e ajuste de estoque da loja, parametrização de produtos disponíveis e autorização de operações sensíveis (como cancelamentos de pedidos após envio à cozinha e concessão de descontos manuais).
5. Gestor da Matriz (Franqueadora): Usuário corporativo com acesso a painéis de controle consolidados, relatórios de vendas regionais, indicadores de desempenho e trilhas de auditoria das operações de toda a rede.
6. Gateway de Pagamento Externo: Serviço parceiro desacoplado responsável pela validação, cobrança e confirmação das transações financeiras (cartão, Pix, carteiras digitais).

## 4. Particularidades Operacionais da Rede de Franquias

A expansão no modelo de franquias traz particularidades que devem ser tratadas como regras de negócio obrigatórias no sistema:

1. Variação Estrutural de Unidades: Nem todas as lojas possuem cozinha completa. Unidades com estrutura reduzida trabalham com cardápio compacto. Para evitar quebras de expectativa e pedidos cancelados, o sistema deve ocultar preventivamente os itens não suportados pelo formato daquela unidade, impedindo que o cliente sequer visualize ou adicione produtos indisponíveis ao carrinho.
2. Sazonalidade e Variações Regionais: Certos produtos só estão ativos em períodos específicos do ano (como o ciclo junino) ou sofrem pequenas adaptações de receita por região. O catálogo do sistema deve ser dinâmico e flexível, permitindo ativação e inativação programada por unidade e por data.
3. Gestão e Consistência de Estoque Local: O estoque é descentralizado por loja. As baixas de insumos e itens acabados devem ocorrer no momento da confirmação do pedido, evitando que um mesmo item seja vendido simultaneamente no aplicativo e no totem.
4. Auditoria e Rastreabilidade da Matriz: Toda operação sensível (cancelamentos, estornos e alterações de preço) deve registrar obrigatoriamente data, hora, unidade, usuário responsável e justificativa, garantindo a governança da franqueadora sobre as franquias.
