const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

class ScannerVision {
  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = process.env.AZURE_OPENAI_KEY;
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'Cerebro-Elsommelier-RD';
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01';

    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async analizarEtiquetaVino(imagenBase64, userId = null) {
    try {
      const prompt = `Eres un experto sommelier. Analiza la imagen y responde SOLO en JSON con: nombre, bodega, variedad, año, region, denominacion, alcohol, tipo, confianza, notas.`;

     const url = `${this.endpoint}openai/deployments/Cerebro-Elsommelier-RD/chat/completions?api-version=2024-08-01-preview`;
      console.log('Azure URL:', url);

      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${imagenBase64}` }
                }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      });

      const result = await apiResponse.json();
      if (result.error) throw new Error(result.error.message);

      const content = result.choices[0].message.content.replace(/```json|```/g, '').trim();
      const datosVino = JSON.parse(content);

      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .insert([{
          ...datosVino,
          user_id: userId,
          fecha_escaneo: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      return { success: true, vino: data[0] };

    } catch (error) {
      console.error('Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ScannerVision();
