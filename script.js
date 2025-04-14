/**
 * @file Script principal para a aplicação de listagem e comparação de Pokémon.
 * Este script interage com a PokeAPI para buscar, exibir detalhes e comparar Pokémon.
 */

/**
 * Elementos do DOM que serão manipulados pelo script.
 */
const pokemonListDiv = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const pokemonDetailsDiv = document.getElementById('pokemon-details');
const detailsContentDiv = document.getElementById('details-content');
const closeDetailsButton = document.getElementById('close-details');
const comparisonDiv = document.getElementById('comparison');
const comparisonContentDiv = document.getElementById('comparison-content');
const closeComparisonButton = document.getElementById('close-comparison');

/**
 * Array para armazenar todos os Pokémon carregados da API, contendo seus detalhes completos.
 * @type {Array<Object>}
 */
let allPokemon = [];

/**
 * Objeto que armazena os detalhes do Pokémon atualmente selecionado para visualização.
 * @type {?Object}
 */
let selectedPokemon = null;

/**
 * Array para armazenar os Pokémon selecionados para comparação. Máximo de 2 Pokémon.
 * @type {Array<Object>}
 */
let pokemonToCompare = [];

/**
 * Busca a lista inicial de Pokémon da PokeAPI e, para cada um, busca seus detalhes completos.
 * Após obter todos os detalhes, a função `displayPokemonCards` é chamada para exibir os Pokémon em formato de cards.
 * @async
 * @param {string} url - A URL da PokeAPI para buscar a lista de Pokémon.
 * @throws {Error} Se houver um erro ao buscar a lista ou os detalhes dos Pokémon.
 */
async function fetchPokemonList(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pokemonDetailsPromises = data.results.map(async (poke) => {
            const detailsResponse = await fetch(poke.url);
            const detailsData = await detailsResponse.json();
            console.log("Detalhes do Pokémon recebidos:", detailsData.name, detailsData); // Log para depuração
            return detailsData;
        });
        allPokemon = await Promise.all(pokemonDetailsPromises);
        console.log("Todos os Pokémon com detalhes:", allPokemon); // Log para depuração
        displayPokemonCards(allPokemon);
    } catch (error) {
        console.error("Erro ao buscar lista de Pokémon:", error);
        pokemonListDiv.innerHTML = '<p>Erro ao carregar a lista de Pokémon.</p>';
    }
}

/**
 * Exibe a lista de Pokémon em formato de cards na interface do usuário.
 * Cada card contém a imagem e o nome do Pokémon, e ao ser clicado, aciona a exibição dos detalhes.
 * @param {Array<Object>} pokemonDetailsList - Array contendo os detalhes completos de cada Pokémon a ser exibido.
 */
function displayPokemonCards(pokemonDetailsList) {
    pokemonListDiv.innerHTML = '';
    pokemonDetailsList.forEach(poke => {
        console.log("Dados do Pokémon para o card:", poke.name, poke); // Log para depuração
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.addEventListener('click', () => displayPokemonDetails(poke));

        const image = document.createElement('img');
        if (poke.sprites && poke.sprites.front_default) {
            image.src = poke.sprites.front_default;
            image.alt = poke.name;
        } else {
            console.error("URL da imagem não encontrada para:", poke.name, poke.sprites);
            image.alt = "Imagem não disponível";
        }

        const name = document.createElement('h3');
        const capitalizedName = poke.name.charAt(0).toUpperCase() + poke.name.slice(1);
        name.textContent = capitalizedName;

        card.appendChild(image);
        card.appendChild(name);
        pokemonListDiv.appendChild(card);
    });
}

/**
 * Busca os detalhes de um Pokémon específico na PokeAPI usando sua URL.
 * Após obter os detalhes, a função `displayPokemonDetails` é chamada para exibir as informações.
 * @async
 * @param {string} url - A URL da PokeAPI para buscar os detalhes do Pokémon.
 * @throws {Error} Se houver um erro ao buscar os detalhes do Pokémon.
 */
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayPokemonDetails(data);
    } catch (error) {
        console.error("Erro ao buscar detalhes do Pokémon:", error);
        detailsContentDiv.innerHTML = '<p>Erro ao carregar os detalhes do Pokémon.</p>';
    }
}

/**
 * Exibe os detalhes do Pokémon selecionado na interface do usuário.
 * Inclui nome, imagem, ID, altura, peso, tipos, status e a soma total dos status.
 * Também adiciona um botão para adicionar o Pokémon à lista de comparação.
 * @param {Object} pokemon - Objeto contendo os detalhes do Pokémon a ser exibido.
 */
function displayPokemonDetails(pokemon) {
    selectedPokemon = pokemon;
    const statsSum = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

    const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    detailsContentDiv.innerHTML = `
        <h3>${capitalizedName.toUpperCase()}</h3>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>ID: ${pokemon.id}</p>
        <p>Altura: ${pokemon.height / 10} m</p>
        <p>Peso: ${pokemon.weight / 10} kg</p>
        <p>Tipos: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <h4>Status:</h4>
        <ul>
            ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>
        <p>Soma dos Status: <strong>${statsSum}</strong></p>
        <button id="compare-button">Comparar</button>
    `;

    const compareButton = document.getElementById('compare-button');
    compareButton.addEventListener('click', () => handleComparePokemon(pokemon));

    pokemonDetailsDiv.classList.remove('hidden');
}

/**
 * Event listener para o clique no botão de pesquisa.
 * Filtra a lista de Pokémon com base no termo de pesquisa inserido pelo usuário e exibe os resultados.
 */
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredPokemon = allPokemon.filter(poke => poke.name.includes(searchTerm));
    displayPokemonCards(filteredPokemon);
});

/**
 * Event listener para a entrada de texto no campo de pesquisa.
 * Se o campo estiver vazio, exibe a lista completa de Pokémon.
 */
searchInput.addEventListener('input', () => {
    if (searchInput.value === '') {
        displayPokemonCards(allPokemon);
    }
});

/**
 * Event listener para a tecla 'Enter' pressionada no campo de pesquisa.
 * Simula um clique no botão de pesquisa.
 * @param {KeyboardEvent} event - O objeto do evento de teclado.
 */
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

/**
 * Event listener para o clique no botão de fechar da seção de detalhes do Pokémon.
 * Esconde a seção de detalhes e limpa o Pokémon selecionado.
 */
closeDetailsButton.addEventListener('click', () => {
    pokemonDetailsDiv.classList.add('hidden');
    selectedPokemon = null;
});

/**
 * Busca os detalhes completos de um Pokémon para a comparação, caso ainda não os tenha.
 * @async
 * @param {Object} pokemon - Objeto do Pokémon (pode conter apenas nome e URL inicialmente).
 * @returns {Promise<Object>} - Promise que resolve para o objeto do Pokémon com seus detalhes completos.
 */
async function getPokemonDetailsForComparison(pokemon) {
    if (!pokemon.sprites) {
        const response = await fetch(pokemon.url);
        return await response.json();
    }
    return pokemon;
}

/**
 * Adiciona o Pokémon selecionado à lista de comparação (máximo de 2).
 * Se dois Pokémon já foram selecionados, a função `compareTwoPokemon` é chamada.
 * @async
 * @param {Object} pokemon - Objeto do Pokémon a ser adicionado para comparação.
 */
async function handleComparePokemon(pokemon) {
    const pokemonDetails = await getPokemonDetailsForComparison(pokemon);
    if (pokemonToCompare.length < 2) {
        pokemonToCompare.push(pokemonDetails);
        alert(`Pokémon ${pokemonDetails.name} adicionado para comparação (${pokemonToCompare.length}/2).`);
        if (pokemonToCompare.length === 2) {
            compareTwoPokemon();
        }
    } else {
        compareTwoPokemon();
    }
}

/**
 * Compara os status de dois Pokémon selecionados e exibe o resultado na interface do usuário.
 * Após a comparação, a lista de Pokémon para comparação é limpa e a seção de detalhes é escondida.
 */
function compareTwoPokemon() {
    if (pokemonToCompare.length === 2) {
        const pokemon1 = pokemonToCompare[0];
        const pokemon2 = pokemonToCompare[1];

        const sum1 = pokemon1.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
        const sum2 = pokemon2.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

        let resultText = `<h3>Comparação: ${pokemon1.name.toUpperCase()} vs ${pokemon2.name.toUpperCase()}</h3>`;
        resultText += `<div class="comparison-pokemon">`;
        resultText += `  <img src="${pokemon1.sprites.front_default}" alt="${pokemon1.name}">`;
        resultText += `  <p><strong>${pokemon1.name.toUpperCase()}</strong></p>`;
        resultText += `  <p>Soma dos Status: <strong>${sum1}</strong></p>`;
        resultText += `</div>`;
        resultText += `<div class="comparison-pokemon">`;
        resultText += `  <img src="${pokemon2.sprites.front_default}" alt="${pokemon2.name}">`;
        resultText += `  <p><strong>${pokemon2.name.toUpperCase()}</strong></p>`;
        resultText += `  <p>Soma dos Status: <strong>${sum2}</strong></p>`;
        resultText += `</div>`;

        if (sum1 > sum2) {
            resultText += `<p><strong>${pokemon1.name.toUpperCase()}</strong> tem a maior soma de status.</p>`;
        } else if (sum2 > sum1) {
            resultText += `<p><strong>${pokemon2.name.toUpperCase()}</strong> tem a maior soma de status.</p>`;
        } else {
            resultText += `<p>Ambos têm a mesma soma de status.</p>`;
        }

        comparisonContentDiv.innerHTML = resultText;
        comparisonDiv.classList.remove('hidden');
        pokemonToCompare = [];

        pokemonDetailsDiv.classList.add('hidden');
        selectedPokemon = null;
    } else {
        alert('Selecione dois Pokémon para comparar.');
    }
}

/**
 * Event listener para o clique no botão de fechar da seção de comparação.
 * Esconde a seção de comparação e limpa a lista de Pokémon para comparação.
 */
closeComparisonButton.addEventListener('click', () => {
    comparisonDiv.classList.add('hidden');
    pokemonToCompare = [];
});

/**
 * Inicializa a aplicação buscando a lista inicial de Pokémon ao carregar a página.
 */
fetchPokemonList('https://pokeapi.co/api/v2/pokemon/?limit=151');