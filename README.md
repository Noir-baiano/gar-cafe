# GAR Café

Loja demonstrativa para o trabalho de **Gestão dos Negócios Agroindustriais**. A proposta combina café arábica, barris de carvalho que receberam pimenta biquinho e um molho de pimenta próprio.

O site é estático, responsivo, sem dependências de instalação, sem cadastro e sem cobranças. Não requer servidor de aplicação nem banco de dados. Todas as imagens, fontes de sistema e scripts funcionam sem serviços externos.

## Abrir a loja agora

Abra `docs/index.html` no navegador. Para testar por HTTP com Node.js instalado, execute `npm run dev` e acesse o endereço exibido no terminal. O navegador pode restringir a função de copiar texto quando a página é aberta diretamente como arquivo; a compra simulada continua funcionando.

## Publicar no GitHub Pages

1. Crie um repositório público chamado `gar-cafe` na sua conta do GitHub.
2. Envie o conteúdo desta pasta para a raiz do repositório, preservando a pasta `docs` e seus arquivos. O ZIP precisa ser extraído antes do envio.
3. Em **Settings → Pages → Build and deployment**, selecione **Deploy from a branch**, a branch **main** e a pasta **/docs**. Salve.
4. Aguarde a publicação e use o endereço exibido pelo próprio GitHub na área **Pages**.

Não há etapa de build. Todos os caminhos do site são relativos para funcionar no endereço do repositório. A pasta `docs` contém apenas os arquivos públicos da loja.

Esta publicação é uma demonstração educacional. Para operar comércio eletrônico real, será necessário escolher uma hospedagem que permita essa atividade e integrar pagamentos, atendimento, pedidos e frete reais. Os termos do GitHub Pages restringem seu uso como plataforma de comércio eletrônico real.

Documentação oficial: https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site e https://docs.github.com/pt/pages/getting-started-with-github-pages/github-pages-limits

## O que funciona

- Coleção com filtros, detalhes de cada produto, escolha de moagem e quantidade.
- Sacola com adição, remoção, ajuste de unidades e memória local entre visitas.
- Cupom **GAR15**: 15% na primeira compra demonstrativa, sem desconto no frete.
- Kit com 3% de desconto no preço; GAR15 também pode incidir sobre esse valor.
- Clube GAR: R$ 1 líquido em produtos gera 1 ponto inteiro. Cada 100 pontos podem ser resgatados por R$ 3, até 10% dos produtos. Pontos não acumulam com GAR15.
- Conclusão do pedido simulado, resumo copiável e atualização dos pontos.
- Atendimento demonstrativo com mensagem copiável, sem alegar envio.
- Perguntas frequentes, menu móvel e reinício da demonstração.
- Compatibilidade opcional com WebMCP, quando o navegador implementar a API: consulta de catálogo, consulta de sacola e adição de produto. A ausência dessa API não afeta a loja.

## Catálogo do plano acadêmico

| Produto | Conteúdo | Preço |
| --- | --- | --- |
| Café de Barril | 250 g | R$ 49,90 |
| Café de Origem | 250 g | R$ 34,90 |
| Molho de Pimenta | 150 mL | R$ 24,90 |
| Kit Encontro GAR | Café de Barril 250 g + molho 150 mL | R$ 72,56 |

Frete fixo **demonstrativo**: R$ 25 por pedido. Ele não representa uma cotação de transportadora. Os preços e as regras representam o plano da equipe, não cotações de mercado atualizadas.

## Roteiro rápido para apresentar

1. Abra o site e apresente a história do barril.
2. Escolha o Kit Encontro GAR, selecione a moagem e adicione à sacola.
3. Aplique GAR15. Uma unidade fica em R$ 61,68 em produtos + R$ 25 de frete = R$ 86,68.
4. Para demonstrar o clube no mesmo roteiro, aumente para duas unidades antes de concluir: R$ 148,35 no total e 123 pontos.
5. Conclua a compra demonstrativa. Faça outro pedido de um kit e use 100 pontos para obter R$ 3 de desconto; o total será R$ 94,56 com frete.
6. Use “Reiniciar demonstração” no rodapé para voltar ao início antes da apresentação.

## Alterar conteúdo

- `docs/store.js`: produtos, preços em centavos, regras de desconto e frete.
- `docs/index.html`: textos, seções e marcação da página.
- `docs/styles.css`: cores, layout e comportamento responsivo.
- `docs/app.js`: interface, sacola, clube, pedidos e atendimento.
- `docs/assets/`: imagens, logo fornecida pela equipe e favicon.

Ao alterar preços, revise também o destaque do kit em `index.html`. Antes de um lançamento real, substitua o contato demonstrativo por um canal comercial autorizado. Não inclua tokens ou senhas no código público.

## Validação

Execute `npm test` para conferir os cálculos de cupom, kit, resgate de pontos, frete, arredondamento e saneamento do estado local. A interface foi revisada no navegador, incluindo a compra e uma apresentação responsiva em viewport de 390 × 844 px. O arquivo `tests/mobile-preview.html` é usado somente pelo servidor de desenvolvimento e não é publicado na pasta `docs`.

A API WebMCP não estava disponível no navegador de validação, portanto os seus adaptadores opcionais não foram testados por execução. Os fluxos normais da loja não dependem deles.

## Limites da demonstração

Não há processamento de pagamento, entrega de mercadorias, autenticação, estoque compartilhado, envio de mensagens ou conta de cliente. Os pontos e pedidos são somente uma simulação neste navegador. Não são coletados endereços, números de cartão ou dados pessoais. Não há rastreadores.

As fotos são representações conceituais geradas para este projeto. A logo foi fornecida pela equipe. Processo, tempos no barril, segurança de produção e características sensoriais precisam ser validados para a comercialização dos alimentos.
