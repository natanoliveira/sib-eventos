Etapa 1

Leir o projeto e identifique se há next e/ou vite, caso tenha os dois, alterar o projeto somente para next.js (com uma versão estável e segura) e com a estrutura de pastas para api no mesmo projeto. Você pode consultar o arquivo src/readme.md para ir memorizando;Após estruturar o projeto, verificar os arquivos desnecessários e move-los para uma pasta chamada /trash para serem deletados posteriormente;Alterar e/ou criar os módulos no package.json com versões estáveis confiáveis para evitar ataques DoS;Configure o projeto para utilizar o prisma para o postgreSQL, criar um arquivo de seed com dados;Criar uma estrutura de usuários onde o administrador pode colcoar permissão em módulos ou rotas específicos;Baixar todos os componentes shadcn e implementar nas páginas caso não existam no projeto;Criar uma integração com o stripe para tickes, pagamentos e um dashboard de monitramento de receitas;Testar toda a aplicação com a porta do next na 3001;Criar um arquivo de tudo que foi solicitado e foi realizado;Memorize tudo!

Etapa 2

Atualize o node para versão >= 20. Atualize a engine e verifique a compatibilidade dos pacotes com a versão;Verificar se está criando passaporte/fatura com seus tickets;Cada pagamento é referente ao um ticket como baixa de parcelamento;Desenvolver novas features seguindo a estrutura implementada;

Etapa 3

Verificar toda a estrutura do projeto e numerar inconsisctencias para resolução;Enviei uma pasta src para dentro de trash verificar se ela é necessária para o funcionamento da aplicação, restaurar caso seja necessário para a estrutura do next;Retirar todas as duplicdades de arquivos e manter a estrutura única do next com router de api;Executar o build e resolver todas as incoscistências, faça todos os testes possíveis;Antes de iniciar a aplicação remova as pastas de build, .next, node_modules e instalar novamente os módulos do node;Etapa 4Crie uma página de inscrições para o evento que estiver aberto fora do dashboard com consulta de telefone, email ou nome (autocomplete) do membro. A página listará eventos abertos e o membro fora da área administrativa escolherá qualquer evento que queira se inscrever. Na listagem precisa ser exibida os dados do evento como descrição, valor, prazo e situação;

Etapa 5

Validar modelagem de dados, sendo:-Eventos N:N Pessoas (haverá uma entidade relacional para ligar membros e eventos participantes)-Parcelas 1:N Pagamentos-Faturas 1:N ParcelasRedire todas as reduundâncias que tiver no modelo schema.Em toda listagem de dados criar um loading antes esperando a promessa da rota (pessoas, inscrições, eventos, pagamentos, faturas, parcelas);Mudar o hover dos botões pois a cor não está sendo executada no hover;Criar modal de edição de evento e dialog de confirmação de deleção de eventos (deleção lógica, ou seja, update em coluna removed = true/false);Criar espaço upload de avatar/image em usuários e pessoas;Testar as alterações feitas com build e ajustar caso seja necessário;Tem permissão para tais tarefas;

Etapa 6

Na página /inscricoes/sucesso/ pode manter a exibição da confirmação de inscrição e dar opção bem nítida para acessar o checkout da stripe para que ele pague conforme sua vontade;Voltar ao inicio deverar direcionar para a tela de eventos novamente;Corrigir o upload da foto de perfil no modal de MEU PERFIL;Criar modal de edição de evento e dialog de confirmação de deleção de eventos (deleção lógica, ou seja, update em coluna removed = true/false);Em configurações, cria página de gerência de usuários para quando o logado for "admin" para manter os usuários do sistema. O formulário terá inclusão de usuários do sistema e ger6encia de permissões de ações;A página de inscrições está com erros nas rotas com código 401;Mova módulos/arquivos para a pasta /trash/ que não tiverem mais utilizadade conforme as entidades do schema.prisma;Renomear no sistema completo MEMBROS para PESSOAS;

Etapa 7

Ajustar o dialog de logout. Centralize ele no template da tela, ao clicar em sair deve-se disabilitar o botão e exibir um loading e esperar 2 segundos até acessar a função de signout;Os dialogs de exclusão não estão centralizados no template de página geral;Gerar uma função com a função de toast() para que fique genérica e de simples uso e substituir todos os alert() de acordo com seus contextos;Corrigir a exibição e resultado de parcelas que está dando 404 na rota de GET;Corrigir a exibição e resultado de dados na página de faturas;Implemente em todos os submits um loading com botão disabled e icone de loading enquanto clicado conforme fiz no arquivo invoice-generator.tsx nas linhas 304 a 321;Alterar a paleta de cores do projeto, substituir o purple e o pink pr uma paleta moderna e discreta e mude;

Etapa 8

Retirar todos os mocks de registros de listagems e configurações implantados nos arquivos;Em user-profile.tsx, recuperar dados do usuário corretamente e deixar funcionar o upload do avatar/imagem. tem permissão para criar a pasta upload para imagens de avatar;Prepare o api-cliente.ts para receber a requisição de imagem do perfil;Verificar a rota GET /api/event-registrations/ pois está dando 404 e verificar a listagem de dados no front;Ajustar a listagem de faturas no front (invoices) pois não tem uma listagem de dados, adicionar a listagem logo abaixo da orientação;Colocar em todas as listagens de dados do front uma paginação e dinamizar o GET ALL para cada rota nos routers;

#### Etapa 9

-   Mova o arquivo /tmp/project_review.md para uma pasta /tmp/ dentro do projeto pois é de contexto somente do projeto;
-   Remover logs de erro expõem stack traces;
-   Lançar erro se JWT_SECRET não definido em produção;
-   Implementar rate limiting (ex: next-rate-limit);
-   Usar Zod schemas para validação completa em formulários;
-   Configurar headers CORS se API for consumida por outros domínios;
-   Logger estruturado com níveis (ex: winston, pino);
-   Mítigar problemas com a rota GET /api/events pois ela é publica para exibição de eventos e inscrições online;
-   Em POST /api/auth/register validar força da senha e verificar/validar e-mail (tenho função no arquivo /lib/utils.ts validateEmail). O e-mail pode criar uma rota para verificar um ping se o e-mail existe de fato;
-   Retire a redundância de next-auth 4.24.11 + JWT custom (redundância?). Verifique a melhor decisão para o projeto;
-   Faça melhorias no front com Lazy Loading, Memoization, Virtualization, API Response Caching;

#### Etapa 10

-   Faça testes no módulo de membros no dashboard com jest e react testing library;
-   Faça testes no módulo de eventos no dashboard com jest e react testing library;