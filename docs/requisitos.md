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

## 5. Requisitos Funcionais do Sistema (RF)

Os requisitos funcionais detalham as ações, regras de negócio e comportamentos operacionais exigidos para atender a operação omnichannel da rede:

| Identificador | Requisito Funcional | Descrição | Canais Aplicáveis | Atores Envolvidos | Prioridade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| RF-01 | Consulta de Cardápio por Unidade | O sistema deve listar os produtos comercializados filtrando pela unidade escolhida, ocultando automaticamente itens não produzidos em lojas de formato reduzido e respeitando a sazonalidade vigente. | App, Totem, Balcão | Cliente, Atendente | Alta |
| RF-02 | Customização de Itens Regionais | Permitir ao cliente selecionar opções de recheio, adicionais e observações de preparo para produtos típicos (cuscuz, tapiocas, bebidas regionais). | App, Totem, Balcão | Cliente, Atendente | Alta |
| RF-03 | Reserva Atômica de Estoque | Ao avançar para a tela de pagamento, o sistema deve reservar temporariamente os itens no estoque local da unidade por até 10 minutos para prevenir vendas concorrentes duplicadas. | App, Totem, Balcão | Cliente, Atendente | Alta |
| RF-04 | Processamento de Pagamento Desacoplado | O sistema deve solicitar a cobrança ao serviço externo especializado (Pix, cartão de crédito/débito) e registrar a transação apenas como aprovada ou recusada, sem armazenar dados sensíveis de cartão. | App, Totem, Balcão | Cliente, Atendente, Gateway | Alta |
| RF-05 | Envio de Pedido à Cozinha (KDS) | Após a confirmação do pagamento (ou registro manual no balcão em dinheiro), o pedido deve ser despachado automaticamente para a fila visual da cozinha na unidade correspondente. | Todos | Equipe de Cozinha | Alta |
| RF-06 | Gestão e Notificação de Status | O sistema deve atualizar e disponibilizar o status do pedido (Pendente, Em Preparo, Pronto para Retirada, Entregue) no painel de senhas, aplicativo e balcão de pick-up. | App, Totem, Balcão | Cliente, Cozinha, Atendente | Alta |
| RF-07 | Programa de Fidelidade e LGPD | O sistema deve permitir o acúmulo e resgate de pontos mediante identificação voluntária (CPF) e consentimento prévio e explícito para tratamento de dados promocionais. | App, Totem, Balcão | Cliente, Gerente | Média |
| RF-08 | Auditoria de Operações Sensíveis | Exigir autenticação com credencial de perfil gerencial para autorizar cancelamentos com devolução de valor, descontos manuais e exclusão de itens em preparo. | Balcão, Painel Matriz | Gerente, Gestor Matriz | Alta |

## 6. Requisitos Não Funcionais do Sistema (RNF)

Os requisitos não funcionais especificam critérios de qualidade e restrições técnicas baseados na norma ISO/IEC 25010, essenciais para a confiabilidade em horários de pico:

| Identificador | Categoria (ISO 25010) | Descrição do Requisito Não Funcional | Métrica e Critério de Aceitação | Prioridade |
| :--- | :--- | :--- | :--- | :--- |
| RNF-01 | Desempenho / Eficiência | O tempo de carregamento do cardápio e a resposta das requisições de consulta devem ser rápidos para evitar filas. | Tempo de resposta inferior a 2,0 segundos para 95% das requisições sob carga nominal. | Alta |
| RNF-02 | Confiabilidade / Disponibilidade | O sistema deve manter alta disponibilidade operacional, especialmente durante os picos de almoço e jantar. | Disponibilidade mínima mensal de 99,5%, com tolerância máxima a paradas não programadas de 3,6 horas/mês. | Alta |
| RNF-03 | Tolerância a Falhas | O sistema deve isolar falhas do gateway de pagamento, aplicando retentativas automáticas e devolvendo respostas amigáveis sem travamento da interface. | Timeout máximo configurado em 15 segundos para serviços externos com mecanismo de fallback estruturado. | Alta |
| RNF-04 | Usabilidade / Responsividade | A interface do aplicativo e dos totens deve ser intuitiva, adaptando-se ergonomicamente a diferentes tamanhos de tela mobile e terminais touch. | Conclusão da jornada completa de compra em no máximo 4 etapas e taxa de sucesso de navegação superior a 90% em testes com usuários. | Alta |
| RNF-05 | Segurança / LGPD | Todos os dados pessoais cadastrais devem trafegar sob criptografia em trânsito (HTTPS/TLS 1.3), com anonimização em relatórios analíticos da franqueadora. | Criptografia ponta a ponta obrigatória e zero armazenamento de dados sensíveis de pagamento (PCI-DSS alinhado). | Alta |
| RNF-06 | Manutenibilidade e Testabilidade | A arquitetura deve desacoplar regras de negócio das integrações de hardware e gateway externo para viabilizar testes automatizados isolados. | Cobertura mínima de 80% nos testes automatizados das regras centrais de pedido e concorrência de estoque. | Alta |

## 7. Detalhamento da Feature Crítica: Fluxo de Realização e Pagamento de Pedidos Multicanal

Conforme exigido pelo Roteiro da disciplina, foi selecionada a funcionalidade central do negócio para o detalhamento de 8 requisitos de qualidade mensuráveis e objetivos:

1. Desempenho da API de Catálogo: A busca e renderização dos itens do cardápio filtrados por unidade não deve ultrapassar 1,5 segundos em conexões 4G estáveis ou na rede local da loja.
2. Tempo de Conclusão da Compra: O fluxo de adicionar produtos, selecionar adicionais e chegar à confirmação do pedido não deve exigir mais do que 4 telas ou cliques principais no Totem e no App.
3. Alta Disponibilidade do Checkout: O serviço de finalização de pedidos deve apresentar índice de disponibilidade igual ou superior a 99,8% nos intervalos de pico operacional (das 11h às 14h e das 18h às 21h).
4. Confiabilidade na Validação de Saldo de Estoque: Em condições de concorrência com 100 requisições simultâneas para o mesmo item na mesma unidade física, o sistema deve garantir que zero pedidos sejam confirmados acima do estoque real.
5. Tolerância a Falhas no Gateway de Pagamento: Em caso de indisponibilidade ou lentidão do serviço externo de pagamento, o sistema deve abortar a tentativa em no máximo 10 segundos, liberar a reserva de estoque e emitir notificação clara ao cliente sem encerrar a sessão.
6. Usabilidade e Prevenção de Erros na Seleção: A interface deve exigir confirmação visual explícita da unidade física escolhida para retirada antes de liberar o botão de pagamento, mitigando em 95% o erro de retirada na unidade incorreta.
7. Segurança no Tráfego de Cobrança: Nenhuma informação de cartão de crédito (número completo, CVV) deve passar ou residir nos servidores centrais da franquia; as transações devem utilizar exclusivamente tokens criptografados fornecidos pelo gateway externo.
8. Observabilidade e Rastreabilidade Transacional: Cada tentativa de pedido deve gerar um identificador global único (UUID), registrando logs estruturados com tempo de resposta, canal de origem, unidade e status financeiro com latência de log inferior a 500 milissegundos.

## 8. Matriz Preliminar de Rastreabilidade (Requisitos -> Testes -> Evidências)

A tabela abaixo estabelece o vínculo bidirecional entre os requisitos levantados, os procedimentos de teste planejados e os artefatos de evidência que serão produzidos:

| ID Requisito | Requisito Associado | Tipo / Nível de Teste | Caso de Teste Planejado | Evidência de Validação Esperada |
| :--- | :--- | :--- | :--- | :--- |
| TR-01 | RF-01 (Filtro por Unidade) | Teste de Sistema (E2E) | Validar que itens de cozinha completa não aparecem no cardápio de unidades compactas. | Screenshot da tela do cardápio e resposta JSON do endpoint de catálogo. |
| TR-02 | RF-03 (Reserva de Estoque) | Teste de Integração / Concorrência | Simular requisições paralelas de compra para o último item disponível. | Log de execução demonstrando bloqueio atômico e rejeição da segunda transação. |
| TR-03 | RF-04 (Pagamento Desacoplado) | Teste de Integração (Mock) | Validar resposta de sucesso e de recusa por saldo insuficiente com mock do gateway. | Relatório de execução de testes de API com códigos de status HTTP 200 e 402/400. |
| TR-04 | RF-05 (Envio à Cozinha) | Teste de Integração | Confirmar se pedido pago no Totem surge imediatamente na fila KDS da cozinha. | Captura de tela do terminal de cozinha e registro de evento no banco de dados. |
| TR-05 | RF-07 (LGPD e Fidelidade) | Teste de Sistema | Verificar obrigatoriedade do checkbox de consentimento antes de pontuar cliente no App. | Screenshot da tela de consentimento e teste automatizado validando persistência do opt-in. |
| TR-06 | RF-08 (Auditoria Gerencial) | Teste de Segurança / RBAC | Tentar cancelar pedido com perfil de atendente comum e com perfil gerencial. | Registro de bloqueio de acesso (HTTP 403) para atendente e aprovação com log para gerente. |
| TR-07 | RNF-01 (Desempenho < 2s) | Teste de Desempenho / Carga | Submeter o endpoint de catálogo a 200 usuários simultâneos simulando horário de almoço. | Relatório de tempos de resposta e gráfico de percentil gerado pela suíte de testes. |
| TR-08 | RNF-03 (Tolerância a Timeout) | Teste de Resiliência | Simular atraso proposital de 15 segundos na resposta do gateway de pagamento. | Relatório de execução demonstrando disparo do timeout e mensagem amigável ao cliente. |

## 9. Análise de Riscos Operacionais e Conformidade com a LGPD

### 9.1. Riscos Operacionais em Horários de Pico
- Risco de Sobrecarga e Concorrência: A ocorrência de acessos simultâneos no App e Totens pode causar lentidão na fila da cozinha e venda de produtos esgotados. Mitigação: Uso de cache local para leitura do catálogo e filas assíncronas com bloqueio transacional na confirmação do pedido.
- Risco de Queda na Rede Externa: Se a conexão com a internet oscilar na loja física, os totens e o balcão podem ser impactados. Mitigação: Operação do balcão presencial com contingência local para emissão e impressão do pedido, sincronizando os dados com a matriz assim que o link for restabelecido.

### 9.2. Diretrizes de Privacidade e Conformidade com a LGPD
- Minimização de Dados: O sistema exige estritamente os dados necessários para o atendimento. Clientes no balcão e no totem podem concluir pedidos anonimamente, sem necessidade de informar CPF ou nome.
- Consentimento Explícito: Para participação no programa de fidelidade e recebimento de promoções regionais, o cliente deve marcar ativamente a caixa de autorização (opt-in), acompanhada de link claro para a Política de Privacidade simplificada.
- Ciclo de Vida e Anonimização: Os dados pessoais vinculados aos pedidos concluídos devem ser descaracterizados para fins estatísticos após o período fiscal obrigatório, impedindo a identificação do cliente em relatórios gerenciais da franqueadora.
