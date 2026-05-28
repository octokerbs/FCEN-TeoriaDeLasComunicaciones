// Quick smoke test for the Gemini integration.
// Usage: npx tsx scripts/test-gemini.ts
import "dotenv/config";
import { gradeOpenAnswer } from "../src/lib/gemini";

async function main() {
  console.log("→ Testing Gemini integration...\n");

  if (!process.env.GEMINI_API_KEY) {
    console.error("✗ GEMINI_API_KEY no está cargada en .env");
    process.exit(1);
  }

  console.log("✓ GEMINI_API_KEY presente");
  console.log(`✓ Modelo: ${process.env.GEMINI_MODEL ?? "gemini-2.5-flash"}\n`);

  const result = await gradeOpenAnswer({
    prompt:
      "Enunciá y explicá el Teorema de Capacidad del Canal de Shannon.",
    modelAnswer:
      "El Teorema de Capacidad del Canal de Shannon establece que la velocidad binaria teórica máxima de transmisión para un canal con ancho de banda B y relación señal-ruido SNR es C = B · log₂(1 + SNR). Es un límite teórico absoluto: ningún esquema de codificación puede superarlo. Aumentar B o la potencia tiene rendimientos decrecientes por el aumento de ruido captado e intermodulación.",
    rubric: [
      {
        id: "formula",
        label: "Enuncia la fórmula C = B·log₂(1+SNR)",
        weight: 3,
        mustInclude: ["log", "SNR", "B"],
      },
      {
        id: "limite",
        label: "Aclara que es un límite teórico absoluto",
        weight: 2,
        mustInclude: ["límite", "teórico"],
      },
      {
        id: "tradeoff",
        label: "Discute trade-offs de aumentar B o potencia",
        weight: 2,
        mustInclude: ["ruido"],
      },
    ],
    studentAnswer:
      "El teorema de Shannon dice que la capacidad máxima de un canal está dada por C = B·log₂(1+SNR), donde B es el ancho de banda y SNR la relación señal-ruido. Esto es un límite absoluto: no podés transmitir más rápido aunque uses códigos super sofisticados. Aumentar la potencia ayuda hasta cierto punto porque empieza a aumentar el ruido por intermodulación.",
  });

  console.log("== Resultado ==");
  console.log(`Score global: ${(result.overallScore * 100).toFixed(0)}%`);
  console.log(`Nivel: ${result.level}`);
  console.log(`\nResumen: ${result.shortSummary}\n`);

  console.log("Fuertes:");
  for (const s of result.strengths) console.log(`  • ${s}`);

  console.log("\nFaltas:");
  for (const g of result.gaps) console.log(`  • ${g}`);

  console.log("\nSugerencias:");
  for (const s of result.suggestions) console.log(`  • ${s}`);

  console.log("\nRubric:");
  for (const r of result.rubricScores) {
    console.log(
      `  [${r.id}] ${(r.score * 100).toFixed(0)}% — ${r.comment}`,
    );
  }

  console.log("\n✓ Gemini OK");
}

main().catch((e) => {
  console.error("✗ Falló:", e);
  process.exit(1);
});
