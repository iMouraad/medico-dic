// Geocodifica "dirección, ciudad" a coordenadas usando Nominatim (OpenStreetMap),
// que es gratuito y no requiere API key. Se llama desde el servidor (no desde
// el navegador) para poder mandar un User-Agent identificable, tal como pide
// la política de uso de Nominatim: https://operations.osmfoundation.org/policies/nominatim/
//
// Uso esperado: una request por cada vez que un médico guarda su perfil con
// dirección/ciudad nueva. Volumen bajo, dentro del límite de 1 req/seg.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'NEOSDOC-DirectorioMedico/1.0 (contacto: soporte@neosdoc.com)';

export async function POST(request: Request) {
    const { address, city } = await request.json();

    if (!city || typeof city !== 'string') {
        return Response.json({ error: 'city es requerido' }, { status: 400 });
    }

    const query = [address, city, 'Ecuador'].filter(Boolean).join(', ');
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'es' },
        });

        if (!res.ok) {
            return Response.json({ error: 'No se pudo geocodificar' }, { status: 502 });
        }

        const results = (await res.json()) as { lat: string; lon: string }[];
        if (!results.length) {
            return Response.json({ latitude: null, longitude: null });
        }

        return Response.json({
            latitude: Number(results[0].lat),
            longitude: Number(results[0].lon),
        });
    } catch {
        return Response.json({ error: 'No se pudo geocodificar' }, { status: 502 });
    }
}
