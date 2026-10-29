# Plano de Garantia da Qualidade (QA Plan) e Especificação de Testes - Rede Raízes do Nordeste

## 1. Introdução e Objetivos da Qualidade

O presente Plano de Garantia da Qualidade (Quality Assurance Plan - QA Plan) estabelece as diretrizes, metodologias, ferramentas e critérios de validação aplicados ao ecossistema de software da rede "Raízes do Nordeste". O propósito principal é assegurar que os serviços digitais (Aplicativo Mobile, Totens de Autoatendimento, Terminal de Balcão e Sistema de Cozinha KDS) operem com alto padrão de confiabilidade, segurança, velocidade e integridade de dados, com atenção redobrada aos horários de pico operacional e à conformidade com a LGPD.

Este planejamento alinha as práticas de verificação (garantir que o sistema está sendo construído corretamente) e validação (garantir que o sistema atende às reais necessidades de negócio e dos clientes da franquia), prevenindo a propagação de defeitos para o ambiente produtivo.

## 2. Níveis e Tipos de Teste Adotados

A estratégia de testes é estruturada em múltiplos níveis complementares, cobrindo tanto aspectos funcionais quanto não funcionais:

### 2.1. Testes Unitários
- Objetivo: Verificar de forma estritamente isolada o comportamento de métodos, funções e entidades de domínio.
- Foco: Cálculos de preços e descontos, aplicação de regras de pontuação de fidelidade e validação de regras de cardápio regional/sazonal.
- Ferramental: Framework de testes automatizados com cobertura mínima de 80% da lógica de negócio central.

### 2.2. Testes de Integração
- Objetivo: Validar a comunicação entre módulos internos e a interoperabilidade com serviços externos desacoplados.
- Foco: Chamadas de API REST entre camadas, persistência no banco de dados e comunicação com o simulador (Mock) do Gateway de Pagamento Externo.
- Tratamento de Falhas: Simulação de retornos com sucesso, recusa por saldo insuficiente e simulação de timeout de rede.

### 2.3. Testes de Sistema (Ponta a Ponta / E2E)
- Objetivo: Avaliar o fluxo completo da aplicação sob a perspectiva do usuário final em ambiente controlado e simulado.
- Foco: Jornadas completas de compra (seleção de produto, customização de adicionais, reserva de estoque, pagamento simulado e visualização na cozinha).

### 2.4. Testes de Regressão
- Objetivo: Garantir que novas funcionalidades, correções de bugs ou refatorações de código não causem efeitos colaterais em fluxos já homologados.
- Abordagem: Execução automatizada da suíte de testes de fumaça (Smoke Tests) a cada nova alteração ou entrega no repositório.

### 2.5. Testes de Aceitação do Usuário (UAT)
- Objetivo: Validar se as regras de operação do negócio estão aderentes à rotina das lojas físicas e franqueadas.
- Envolvidos: Representantes operacionais das unidades (gerentes e atendentes) avaliando usabilidade e clareza nos fluxos de pedido e cancelamento.

### 2.6. Testes de Desempenho (Carga e Estresse)
- Objetivo: Mensurar o comportamento do sistema sob alto volume de requisições simultâneas nos períodos de maior fluxo (almoço das 11h às 14h e jantar das 18h às 21h).
- Critério: Tempo médio de resposta da API de catálogo inferior a 2,0 segundos para 95% das requisições com 200 usuários virtuais concorrentes.

### 2.7. Testes de Segurança e Privacidade (LGPD)
- Objetivo: Garantir que dados cadastrais não fiquem expostos e que o controle de acesso por perfis (RBAC) seja estritamente respeitado.
- Foco: Validação de bloqueio em endpoints gerenciais (HTTP 403 para usuários sem permissão), verificação de criptografia no tráfego (HTTPS) e garantia de opt-in explícito no programa de fidelidade.

### 2.8. Testes de Responsividade Mobile e Usabilidade
- Objetivo: Garantir que as interfaces gráficas se adaptem ergonomicamente a smartphones de diferentes resoluções e telas touch dos totens de atendimento físico, permitindo a finalização da compra em poucos toques.

## 3. Papéis, Responsabilidades e Governança

Para garantir a rastreabilidade e a transparência das atividades de qualidade, as responsabilidades são distribuídas da seguinte forma:

| Papel | Responsabilidade Principal | Atividades Chave |
| :--- | :--- | :--- |
| Engenheiro de Qualidade (QA) | Planejamento, automação e governança de testes | Elaborar cenários de teste, implementar automações em Playwright/API, monitorar métricas de cobertura e validar evidências. |
| Desenvolvedor de Software | Implementação e qualidade preventiva | Construir código limpo, criar testes unitários para a lógica de negócio e corrigir defeitos identificados nas rodadas de teste. |
| Gerente de Unidade / Operações | Homologação de rotinas de loja física | Validar usabilidade no totem e no balcão, simular pedidos em horários de pico e reportar inconsistências de estoque. |
| Gestor da Matriz (Franqueadora) | Homologação de regras de franquia | Conferir relatórios de auditoria, autorizar políticas de promoções e validar conformidade legal com a LGPD. |

## 4. Cronograma de Validação e Checklist de Homologação

### 4.1. Ciclo de Validação Semanal
1. Segunda a Terça-feira: Análise de requisitos, escrita de novos cenários de teste e preparação de dados de teste (massa de dados).
2. Quarta a Quinta-feira: Execução de testes de integração, testes automatizados de API/E2E e testes de carga simulados.
3. Sexta-feira: Rodada de regressão automatizada, emissão de relatórios de métricas e reunião de alinhamento com stakeholders.

### 4.2. Checklist de Homologação por Release (Critérios de Aceite para Entrega)
- [ ] 100% dos testes automatizados de regressão executados com status aprovado (Pass).
- [ ] Zero defeitos críticos ou bloqueantes (Severidade 1) em aberto.
- [ ] Cobertura de testes automatizados da lógica de pedidos e estoque superior ou igual a 80%.
- [ ] Validação de resposta do simulador de pagamento com códigos HTTP 200 (sucesso), HTTP 400/402 (recusa) e HTTP 504 (timeout).
- [ ] Verificação de logs de auditoria para operações de cancelamento e desconto.
- [ ] Termo de consentimento LGPD ativo e desmarcado por padrão na tela de cadastro.

## 5. Especificação dos 10 Cenários de Teste Detalhados (Casos Críticos)

Abaixo estão formalizados os 10 cenários de teste detalhados que cobrem o fluxo crítico do sistema (pedido, pagamento desacoplado e consistência de estoque), contemplando casos positivos, negativos e atributos de qualidade:

### CT-01: Realização de Pedido com Sucesso no Totem via Pix (Positivo)
- Requisito Vinculado: RF-01, RF-04, RF-05 e RNF-04.
- Nível de Teste: Sistema / Ponta a Ponta (E2E).
- Pré-condições: Terminal totem operacional, unidade selecionada com cardápio carregado e estoque disponível.
- Passos de Execução:
  1. No totem, tocar na categoria "Tapiocas Regionais".
  2. Selecionar "Tapioca de Carne de Sol com Queijo Coalho" e confirmar adicionais.
  3. Clicar em "Avançar para Pagamento".
  4. Selecionar a opção de pagamento "Pix".
  5. Escanear o QR Code gerado pelo simulador de pagamento com dados de teste válidos.
- Resultado Esperado:
  - O gateway retorna confirmação de transação aprovada.
  - O sistema emite a mensagem "Pedido Confirmado com Sucesso" e gera o código de senha para retirada.
  - O estoque da unidade física é decrementado em 1 unidade.
  - O pedido surge imediatamente na fila visual da cozinha com status "Recebido".
- Critério de Aceite: Transação concluída com emissão de senha em até 3 segundos após a confirmação do pagamento.

### CT-02: Recusa de Pagamento por Saldo Insuficiente (Negativo)
- Requisito Vinculado: RF-04 e RNF-03.
- Nível de Teste: Integração com Mock de Gateway de Pagamento.
- Pré-condições: Carrinho montado com 1 Cuscuz Recheado e reserva de estoque efetuada.
- Passos de Execução:
  1. No checkout, selecionar a opção "Cartão de Crédito".
  2. Inserir dados de teste configurados no Mock para simular "Saldo Insuficiente".
  3. Clicar em "Confirmar Pagamento".
- Resultado Esperado:
  - O simulador de pagamento retorna código de erro de recusa de cobrança.
  - O sistema exibe mensagem amigável: "Transação não autorizada. Verifique os dados do cartão ou escolha outra forma de pagamento".
  - A sessão do usuário permanece aberta no checkout para nova tentativa.
  - A reserva temporária de estoque permanece válida até que o usuário troque a forma de pagamento ou atinja o tempo limite de 10 minutos.
- Critério de Aceite: A interface não congela e apresenta mensagem clara sem expor detalhes técnicos do gateway.

### CT-03: Tolerância a Timeout e Falha de Comunicação com Gateway de Pagamento (Negativo / Resiliência)
- Requisito Vinculado: RF-04, RNF-02 e RNF-03.
- Nível de Teste: Integração / Resiliência.
- Pré-condições: Carrinho finalizado aguardando confirmação externa de cobrança.
- Passos de Execução:
  1. Configurar o simulador do gateway com atraso proposital de 15 segundos (simulando lentidão severa de rede externa).
  2. Clicar no botão "Finalizar Pedido com Cartão".
- Resultado Esperado:
  - O sistema dispara o mecanismo de timeout ao atingir o limite rigoroso de 10 segundos.
  - A requisição é interrompida de forma segura, liberando a thread de execução do terminal.
  - O sistema emite mensagem ao cliente: "Tempo limite de comunicação com o serviço bancário excedido. Nenhuma cobrança foi efetuada. Por favor, tente novamente".
  - A reserva de estoque é liberada imediatamente para evitar retenção indevida.
- Critério de Aceite: Disparo exato do timeout aos 10 segundos, com registro em log estruturado e liberação atômica do estoque.

### CT-04: Concorrência de Compra para o Último Item de Estoque (Negativo / Concorrência)
- Requisito Vinculado: RF-03 e RNF-02.
- Nível de Teste: Integração / Concorrência de Banco de Dados.
- Pré-condições: O item "Bolo de Macaxeira com Calda" possui saldo em estoque igual a 1 unidade na Unidade Recife Centro.
- Passos de Execução:
  1. No Aplicativo Mobile (Cliente A), adicionar 1 unidade do Bolo de Macaxeira e clicar em "Pagar" às 12:00:00 (iniciando reserva atômica).
  2. No Totem físico (Cliente B), tentar avançar para a tela de pagamento do mesmo bolo às 12:00:01.
- Resultado Esperado:
  - O Cliente A obtém a reserva exclusiva do item pelo período de 10 minutos.
  - O sistema detecta que o saldo livre de estoque é zero e impede a reserva do Cliente B.
  - O Totem exibe aviso cordial ao Cliente B: "Desculpe, este produto acabou de ser reservado por outro cliente".
  - O sistema impede a venda duplicada (overbooking).
- Critério de Aceite: Zero ocorrências de pedidos confirmados além do estoque real de 1 unidade física.

### CT-05: Ocultação Preventiva de Itens em Loja com Cozinha Reduzida (Negativo / Regra de Negócio)
- Requisito Vinculado: RF-01.
- Nível de Teste: Sistema / Interface.
- Pré-condições: A unidade "Shopping Express" é parametrizada no sistema com formato estrutural "Cozinha Reduzida".
- Passos de Execução:
  1. No Aplicativo Mobile, alterar a localização e selecionar a unidade "Shopping Express".
  2. Navegar pelo catálogo de produtos procurando pelo "Cuscuz Tradicional Completo" (prato exclusivo de cozinha completa).
- Resultado Esperado:
  - O sistema filtra o cardápio e não renderiza os pratos quentes pesados.
  - O prato não aparece na listagem, não permitindo inclusão no carrinho em nenhum momento.
- Critério de Aceite: Ausência de qualquer item não suportado na resposta JSON da API e na tela do aplicativo para a unidade compacta.

### CT-06: Expiração Automática de Reserva de Estoque por Abandono (Positivo / Rotina em Segundo Plano)
- Requisito Vinculado: RF-03 e RNF-06.
- Nível de Teste: Integração / Processamento Assíncrono.
- Pré-condições: O estoque de "Tapioca Nordestina" é igual a 5 unidades. Um cliente no totem avança para a tela de pagamento, gerando reserva temporária (saldo livre passa para 4 unidades).
- Passos de Execução:
  1. Simular o abandono do terminal pelo cliente sem confirmação de pagamento.
  2. Avançar o relógio do sistema em 10 minutos e 1 segundo.
  3. Executar o job em segundo plano de liberação de reservas expiradas (TTL).
- Resultado Esperado:
  - O sistema identifica que a reserva excedeu o tempo limite de 10 minutos.
  - A reserva temporária é cancelada e o saldo livre de estoque retorna para 5 unidades.
  - O terminal totem é resetado para a tela inicial de boas-vindas.
- Critério de Aceite: Retorno automático do item ao estoque sem necessidade de intervenção humana.

### CT-07: Pedido para Retirada Rápida (Pick-up) via Aplicativo com Fidelidade (Positivo)
- Requisito Vinculado: RF-01, RF-06 e RF-07.
- Nível de Teste: Sistema / Mobile.
- Pré-condições: Cliente autenticado no aplicativo com conta do programa de fidelidade ativa.
- Passos de Execução:
  1. No aplicativo, escolher a opção "Retirada no Balcão (Pick-up)".
  2. Selecionar produtos regionais e aplicar voucher de desconto de pontos acumulados.
  3. Confirmar o pagamento antecipado via cartão de crédito simulado.
  4. Acompanhar a tela de status do pedido até a mensagem "Pronto para Retirada".
- Resultado Esperado:
  - O desconto de pontos é calculado corretamente sobre o subtotal.
  - O sistema emite código alfanumérico e QR Code na tela do smartphone para conferência no balcão físico de pick-up.
  - Novos pontos de fidelidade proporcionais ao valor pago são creditados na conta do cliente.
- Critério de Aceite: Jornada de compra concluída em menos de 4 cliques principais, com notificação push enviada quando o status mudar para "Pronto para Retirada".

### CT-08: Recusa de Consentimento LGPD no Programa de Fidelidade (Negativo / Privacidade)
- Requisito Vinculado: RF-07 e RNF-05.
- Nível de Teste: Sistema / LGPD.
- Pré-condições: Usuário não cadastrado acessando a tela de adesão ao programa de vantagens no Totem.
- Passos de Execução:
  1. Digitar Nome e CPF na tela promocional.
  2. Deixar a caixa de seleção "Concordo com os Termos de Privacidade e Tratamento de Dados" desmarcada.
  3. Tocar no botão "Finalizar Cadastro".
- Resultado Esperado:
  - O sistema bloqueia o avanço e exibe mensagem informativa destacando que o consentimento é indispensável para o acúmulo de pontos.
  - O sistema oferece a opção clara de "Comprar sem Identificação / Modo Anônimo".
  - Ao optar pelo modo anônimo, os dados digitados são descartados da memória e nenhum registro de CPF é armazenado no banco de dados.
- Critério de Aceite: Zero persistência de dados pessoais sem o opt-in explícito do usuário.

### CT-09: Tentativa de Cancelamento de Pedido sem Credencial Gerencial (Negativo / Segurança RBAC)
- Requisito Vinculado: RF-08 e RNF-05.
- Nível de Teste: Segurança / Controle de Acesso Baseado em Papéis.
- Pré-condições: Pedido já despachado para a fila de produção da cozinha.
- Passos de Execução:
  1. No terminal de balcão, o atendente comum clica na opção "Cancelar Pedido com Estorno Financeiro".
  2. O sistema solicita autenticação de perfil com privilégios gerenciais.
  3. O atendente insere sua própria matrícula e senha operacional comum.
- Resultado Esperado:
  - O sistema nega a autorização e exibe mensagem: "Operação não autorizada. Apenas o Gerente da Unidade possui permissão para cancelamento e estorno de pedidos em preparo".
  - O cancelamento não é efetuado e o pedido continua em produção na cozinha.
  - O evento de tentativa de acesso negado é registrado na trilha de auditoria para visualização da franqueadora.
- Critério de Aceite: Bloqueio estrito da operação com código de retorno HTTP 403 na API interna.

### CT-10: Avaliação de Desempenho e Estabilidade em Horário de Pico de Almoço (Não Funcional / Carga)
- Requisito Vinculado: RNF-01 e RNF-02.
- Nível de Teste: Desempenho / Carga.
- Pré-condições: Ambiente de testes configurado com os serviços de API e banco de dados ativos.
- Passos de Execução:
  1. Executar script de testes de carga simulando 200 usuários virtuais concorrentes navegando no cardápio e montando pedidos durante 10 minutos ininterruptos.
  2. Coletar dados de latência, taxa de erro HTTP e utilização de CPU e memória.
- Resultado Esperado:
  - O percentil 95 (p95) do tempo de resposta das requisições deve permanecer abaixo de 2,0 segundos.
  - A taxa de erros HTTP (status 5xx) deve ser inferior a 1% de todas as transações submetidas.
  - A integridade dos dados de estoque deve ser preservada sem inconsistências.
- Critério de Aceite: Conclusão do teste de carga cumprindo os requisitos de tempo de resposta sem queda dos serviços de checkout.

## 6. Critérios de Entrada e Saída da Qualidade (Entry and Exit Criteria)

### 6.1. Critérios de Entrada (Entry Criteria)
- Especificação de requisitos funcionais e não funcionais documentada e aprovada.
- Ambiente de testes e suíte de mocks de pagamento devidamente configurados.
- Massa de dados de teste (cardápio regional, produtos de teste e usuários com diferentes perfis) pré-carregada.

### 6.2. Critérios de Saída (Exit Criteria)
- Execução de 100% dos 10 cenários de teste formais descritos neste documento.
- Índice de defeitos críticos (Severidade 1) igual a zero e defeitos de média severidade tratados ou com plano de contingência aprovado.
- Cobertura de código automatizado igual ou superior a 80%.
- Relatório de evidências técnicas consolidado com capturas de tela e logs de execução.

