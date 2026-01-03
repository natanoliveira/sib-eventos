### Etapa 1

-   Leir o projeto e identifique se há next e/ou vite, caso tenha os dois, alterar o projeto somente para next.js (com uma versão estável e segura) e com a estrutura de pastas para api no mesmo projeto. Você pode consultar o arquivo src/readme.md para ir memorizando;
-   Após estruturar o projeto, verificar os arquivos desnecessários e move-los para uma pasta chamada /trash para serem deletados posteriormente;
-   Alterar e/ou criar os módulos no package.json com versões estáveis confiáveis para evitar ataques DoS;
-   Configure o projeto para utilizar o prisma para o postgreSQL, criar um arquivo de seed com dados;
-   Criar uma estrutura de usuários onde o administrador pode colcoar permissão em módulos ou rotas específicos;
-   Baixar todos os componentes shadcn e implementar nas páginas caso não existam no projeto;
-   Criar uma integração com o stripe para tickes, pagamentos e um dashboard de monitramento de receitas;
-   Testar toda a aplicação com a porta do next na 3001;
-   Criar um arquivo de tudo que foi solicitado e foi realizado;
-   Memorize tudo!

### Etapa 2

-   Atualize o node para versão >= 20. Atualize a engine e verifique a compatibilidade dos pacotes com a versão;
-   Verificar se está criando passaporte/fatura com seus tickets;
-   Cada pagamento é referente ao um ticket como baixa de parcelamento;
-   Desenvolver novas features seguindo a estrutura implementada;

### Etapa 3

-   Verificar toda a estrutura do projeto e numerar inconsisctencias para resolução;
-   Enviei uma pasta src para dentro de trash verificar se ela é necessária para o funcionamento da aplicação, restaurar caso seja necessário para a estrutura do next;
-   Retirar todas as duplicdades de arquivos e manter a estrutura única do next com router de api;
-   Executar o build e resolver todas as incoscistências, faça todos os testes possíveis;
-   Antes de iniciar a aplicação remova as pastas de build, .next, node_modules e instalar novamente os módulos do node;

### Etapa 4

-   Crie uma página de inscrições para o evento que estiver aberto fora do dashboard com consulta de telefone, email ou nome (autocomplete) do membro. A página listará eventos abertos e o membro fora da área administrativa escolherá qualquer evento que queira se inscrever. Na listagem precisa ser exibida os dados do evento como descrição, valor, prazo e situação;

### Etapa 5

-   Validar modelagem de dados, sendo:  
    -Eventos N:N Pessoas (haverá uma entidade relacional para ligar membros e eventos participantes)  
    -Parcelas 1:N Pagamentos  
    -Faturas 1:N Parcelas
-   Redire todas as reduundâncias que tiver no modelo schema.
-   Em toda listagem de dados criar um loading antes esperando a promessa da rota (pessoas, inscrições, eventos, pagamentos, faturas, parcelas);
-   Mudar o hover dos botões pois a cor não está sendo executada no hover;
-   Criar modal de edição de evento e dialog de confirmação de deleção de eventos (deleção lógica, ou seja, update em coluna removed = true/false);
-   Criar espaço upload de avatar/image em usuários e pessoas;
-   Testar as alterações feitas com build e ajustar caso seja necessário;
-   Tem permissão para tais tarefas;