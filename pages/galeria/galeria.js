document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('loadMoreProjects');
    const grid = document.getElementById('galeriaGrid');
    const projectsPerLoad = 3; // Quantos projetos serão carregados por vez
    let currentIndex = 0; // Índice para rastrear quais projetos já foram mostrados

    // ----------------------------------------------------
    // LISTA DE TODOS OS PROJETOS (INCLUINDO OS ESCONDIDOS)
    // ----------------------------------------------------
    // Você deve manter esta lista atualizada com todos os seus projetos.
    const allProjects = [
        // OBS: Estes itens devem seguir a mesma estrutura HTML dos que já estão visíveis no GRID.
        { 
            href: "#projeto-4", 
            imgSrc: "caminho/para/thumbnail-projeto4.jpg", 
            altText: "Título do Projeto 4", 
            tag: "Campanha Digital", 
            title: "Título do Projeto 4" 
        },
        { 
            href: "#projeto-5", 
            imgSrc: "caminho/para/thumbnail-projeto5.jpg", 
            altText: "Título do Projeto 5", 
            tag: "Fashion Film", 
            title: "Título do Projeto 5" 
        },
        { 
            href: "#projeto-6", 
            imgSrc: "caminho/para/thumbnail-projeto6.jpg", 
            altText: "Título do Projeto 6", 
            tag: "Série Web", 
            title: "Título do Projeto 6" 
        },
        { 
            href: "#projeto-7", 
            imgSrc: "caminho/para/thumbnail-projeto7.jpg", 
            altText: "Título do Projeto 7", 
            tag: "Drone Vídeo", 
            title: "Título do Projeto 7" 
        },
        // Adicione mais projetos aqui...
    ];


    // Função para renderizar o HTML de um único projeto
    function createProjectHTML(project) {
        return `
            <a href="${project.href}" class="galeria-item-dark" target="_blank">
                <img src="${project.imgSrc}" alt="${project.altText}">
                <div class="overlay-dark">
                    <span class="category-tag-dark">${project.tag}</span>
                    <h3>${project.title}</h3>
                </div>
            </a>
        `;
    }

    // Função que será chamada ao clicar no botão
    function loadMoreProjects() {
        // Calcula o índice de onde começar e onde parar
        const nextIndex = currentIndex + projectsPerLoad;
        const projectsToLoad = allProjects.slice(currentIndex, nextIndex);
        
        let newProjectsHTML = '';

        projectsToLoad.forEach(project => {
            newProjectsHTML += createProjectHTML(project);
        });

        // Adiciona o novo HTML ao final do grid
        grid.insertAdjacentHTML('beforeend', newProjectsHTML);

        // Atualiza o índice para a próxima rodada
        currentIndex = nextIndex;

        // Verifica se ainda restam projetos na lista
        if (currentIndex >= allProjects.length) {
            // Se todos os projetos foram carregados, esconde o botão
            loadMoreBtn.style.display = 'none';
        }
    }

    // ----------------------------------------------------
    // INICIALIZAÇÃO
    // ----------------------------------------------------
    
    // 1. O botão só deve funcionar se tivermos uma lista de projetos escondidos.
    if (allProjects.length === 0) {
        loadMoreBtn.style.display = 'none';
    }

    // 2. Adiciona o "ouvinte" de clique ao botão
    loadMoreBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Impede o comportamento padrão do link
        loadMoreProjects();
    });

    // Se você já tem os primeiros 3 ou 6 itens no HTML, o currentIndex deve 
    // começar após o número de itens visíveis para que o primeiro clique
    // carregue os próximos.
    // Exemplo: Se 6 itens já estão no HTML, defina:
    // let currentIndex = 6;
});