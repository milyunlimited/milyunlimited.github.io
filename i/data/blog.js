document.addEventListener('DOMContentLoaded', async () => {
    console.log("Silnik bloga: Inicjalizacja ładowania pancernego...");

    const featuredColumn = document.querySelector('.featured-column');
    const olderGrid = document.querySelector('.older-posts-grid');

    if (!featuredColumn || !olderGrid) {
        console.error("Błąd: Nie znaleziono klas .featured-column lub .older-posts-grid w pliku HTML!");
        return;
    }

    try {
        // 1. DYNAMICZNE BUDOWANIE ŚCIEŻKI BEZWZGLĘDNEJ (Zapobiega błędom mapowania katalogów)
        // Skrypt pobiera dokładną lokalizację obecnego pliku i szuka posts.json w tym samym miejscu
        const currentPath = window.location.pathname;
        const directoryPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        
        // 2. CACHE BUSTER (Wymuszenie czyszczenia pamięci podręcznej)
        // Dodajemy unikalny znacznik czasu (?t=...), aby przeglądarka nie czytała starego, błędnego stanu serwera
        const timestamp = new Date().getTime();
        const jsonUrl = `${window.location.origin}${directoryPath}/posts.json?v=${timestamp}`;
        
        console.log(`Próba pobrania pliku z pancernej ścieżki: ${jsonUrl}`);

        // Zapytanie z jawnym nagłówkiem akceptacji JSON-a
        const response = await fetch(jsonUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Serwer zwrócił błąd. Kod statusu HTTP: ${response.status}`);
        }

        const blogPosts = await response.json();

        if (!blogPosts || blogPosts.length === 0) {
            console.warn("Plik posts.json został wczytany, ale baza jest pusta.");
            return;
        }

        // Sortowanie postów od najnowszego
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Czyszczenie kontenerów
        featuredColumn.innerHTML = '';
        olderGrid.innerHTML = '';

        // 1. Najnowszy post (lewa strona)
        if (blogPosts.length > 0) {
            featuredColumn.innerHTML = generatePostCard(blogPosts[0], true);
        }

        // 2. Starsze posty (prawa strona)
        if (blogPosts.length > 1) {
            const olderPosts = blogPosts.slice(1);
            let gridHTML = '';
            olderPosts.forEach(post => {
                gridHTML += generatePostCard(post, false);
            });
            olderGrid.innerHTML = gridHTML;
        }


    } catch (error) {
        console.error("KRYTYCZNY BŁĄD INTEGRACJI JSON:", error.message);
        
        // WYJĄTEK RATUNKOWY (Fallback): Jeśli serwer lokalny ma głęboką blokadę na .json,
        // skrypt wyświetli czytelny komunikat i nie pozwoli, żeby strona wyglądała na uszkodzoną.
        featuredColumn.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 24px; background: #fff5f5; border: 2px solid #feb2b2; border-radius: 16px; color: #c53030;">
                <h3 style="margin-bottom: 8px; font-weight: 700;">Problem z serwerem lokalnym (Błąd wczytywania bazy)</h3>
                <p style="font-size: 0.95rem; line-height: 1.5; color: #9b2c2c;">
                    Plik <strong>posts.json</strong> nie mógł zostać załadowany przez zabezpieczenia przeglądarki lub błędną konfigurację MIME typu na Twoim lokalnym serwerze.<br>
                    <span style="display:block; margin-top: 8px; font-weight:600;">Rozwiązanie: Jeśli używasz VS Code, upewnij się, że otwierasz plik za pomocą "Live Server", a nie klikając dwukrotnie w plik na dysku.</span>
                </p>
            </div>
        `;
    }
});

function generatePostCard(post, isFeatured) {
    let imageHtml = '';
    if (isFeatured && post.image) {
        imageHtml = `
            <div class="post-image-container">
                <img src="${post.image}" alt="${post.title}">
            </div>
        `;
    }

    return `
        <a href="post.html?${post.slug}" class="post-card">
            ${imageHtml}
            <span class="post-category">${post.category || 'Ogólne'}</span>
            <${isFeatured ? 'h2' : 'h3'} class="post-title">${post.title}</${isFeatured ? 'h2' : 'h3'}>
            <p class="post-excerpt">${post.excerpt || ''}</p>
        </a>
    `;
}