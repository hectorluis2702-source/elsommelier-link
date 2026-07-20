const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Vercel usará nuestras llaves secretas para conectar los cables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async function (req, res) {
  // Solo permitimos que reciba órdenes, no que las exponga
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const promptUsuario = req.body.prompt;

    // 1. Despertar a tu comité editorial en formato JSON estricto
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const instruccionMaestra = `Eres un comité editorial internacional y multidisciplinario compuesto por especialistas de élite en destilados de agave. Desarrolla el siguiente tema con rigor técnico, académico y exhaustivo. Devuelve única y estrictamente un objeto JSON válido con estas claves: "fase_numero" (número entero), "fase_nombre" (texto corto), "tema_principal" (texto corto), "contenido_markdown" (texto exhaustivo y denso), "requerimiento_tecnico_imagen" (texto), "fuentes_bibliograficas" (texto). \n\nTema a desarrollar: ${promptUsuario}`;

    // 2. Procesar la redacción
    const result = await model.generateContent(instruccionMaestra);
    const jsonRespuesta = JSON.parse(result.response.text());

    // 3. Inyectar directamente a la bóveda de Supabase
    const { data, error } = await supabase
      .from('enciclopedia_agave')
      .insert([
        {
          fase_numero: jsonRespuesta.fase_numero || 1,
          fase_nombre: jsonRespuesta.fase_nombre || "Fase",
          tema_principal: jsonRespuesta.tema_principal || promptUsuario,
          contenido_markdown: jsonRespuesta.contenido_markdown || "Contenido no generado.",
          requerimiento_tecnico_imagen: { "instruccion": jsonRespuesta.requerimiento_tecnico_imagen },
          fuentes_bibliograficas: { "fuentes": jsonRespuesta.fuentes_bibliograficas }
        }
      ]);

    if (error) throw error;

    // 4. Confirmar el éxito al usuario
    return res.status(200).json({ success: true, mensaje: '¡Tema redactado e inyectado en la base de datos con éxito!' });

  } catch (error) {
    console.error("Error en el motor:", error);
    return res.status(500).json({ error: error.message });
  }
};
