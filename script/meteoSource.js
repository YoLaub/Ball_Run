const URL = "https://www.infoclimat.fr/public-api/gfs/json?_ll=48.85341,2.3488&_auth=UkgCFQ9xByVWe1NkDngKI1U9AzZZLwEmUCwHZF04A34CaVQ1A2NVM1A%2BAH0ALwM1AC0ObV5lCTlXPAB4D31fPlI4Am4PZAdgVjlTNg4hCiFVewNiWXkBJlA0B2JdLgNhAmVULgNiVTdQPgB8ADUDMwAsDnFeYAk2VzcAYA9iXzhSOAJjD28HYFYmUy4OOAo5VW4DalliATxQYQc2XTMDYgJoVGEDMlU2UCEAYwAyAzIAMA5oXmAJM1cwAHgPfV9FUkICew8sBydWbFN3DiMKa1U4Azc%3D&_c=4593554f917bee50d6f9a3148e69852f"
var weatherDataCache = null;

// Fonction pour récupérer les données
export async function fetchUsers() {
  if (weatherDataCache) {
    return weatherDataCache;
  }
  try {
    // Effectuer la requête GET
    const response = await fetch(URL);

    // Vérifier si la réponse est OK (statut HTTP 200-299)
    if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut: ${response.status}`);
    }

    // Parser la réponse en JSON
    const data = await response.json();
    weatherDataCache = data;

    return data;
    
    
  } catch (error) {
    // Gérer les erreurs
    console.error('Erreur lors de la récupération des données:', error);
  }
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function getValueWeather() {
  const getValue = async () => {
    try {
      // Récupérer les données météorologiques et les mettre en cache si nécessaire
      await fetchUsers();
      const dataResponse = weatherDataCache;

      let test = `${getCurrentDate()} 10:00:00`; // Formater la date du jour

      const valueWeather = {
        pressure: (dataResponse[test]["pression"]["niveau_de_la_mer"]) / 100,
        temperature: 274.4 - (dataResponse[test]["temperature"]["2m"]),
        humidity: dataResponse[test]["humidite"]["2m"],
        nebulosity: (dataResponse[test]["nebulosite"]["totale"])
      };

      return valueWeather;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  return getValue();
}

